import {asyncHandler} from "../utils/asyncHandler.js";
import Agent from "../models/agent.model.js";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";

// Use this middleware to verify company access
const verifyCompanyAccess = async (wallet_address) => {

  const company = await Company.findOne({ 
    wallet_address: wallet_address.toLowerCase() 
  });
  
  if (!company) {
    return { 
      valid: false, 
      message: "Unauthorized: Company access required" 
    };
  }
  return { valid: true, company };
};

//Get list of agents 
const getAgents = asyncHandler(async (req, res) => {
  const { company_wallet_address, status } = req.body; 
  // status = "pending_kyc", "pending_approval", "approved" or undefined for all

  if (!company_wallet_address) {
    return res.status(400).json({ success: false, message: "Company wallet address is required" });
  }

  const { valid, message } = await verifyCompanyAccess(company_wallet_address);
  if (!valid) return res.status(403).json({ success: false, message });

  // Get all agents
  let agents = await Agent.find({}).populate("user", "email").lean();

  // Categorize
  const categorized = {
    pending_kyc: agents.filter(a => a.kyc_status === "pending"),
    pending_approval: agents.filter(a => a.kyc_status === "verified" && !a.is_approved),
    approved: agents.filter(a => a.kyc_status === "verified" && a.is_approved)
  };

  if (status && !["pending_kyc", "pending_approval", "approved"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status filter" });
  }

  const result = status ? categorized[status] : categorized;

  res.status(200).json({
    success: true,
    total: Array.isArray(result) ? result.length : agents.length,
    data: result
  });
});

//approval or rejection 
const updateAgentApproval = asyncHandler(async (req, res) => {
  const { company_wallet_address, agent_wallet_address, approve } = req.body;
  // approve = true → approve, false → reject

  if (!company_wallet_address || !agent_wallet_address || approve === undefined) {
    return res.status(400).json({
      success: false,
      message: "Company wallet, agent wallet, and approve flag are required"
    });
  }

  const { valid, message } = await verifyCompanyAccess(company_wallet_address);
  if (!valid) return res.status(403).json({ success: false, message });

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address.toLowerCase() });
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

  if (agent.kyc_status !== "verified" && approve)
    return res.status(400).json({ success: false, message: "Agent KYC must be verified before approval" });

  agent.is_approved = !!approve; // true → approve, false → reject
  await agent.save();

  res.status(200).json({
    success: true,
    message: `Agent has been ${approve ? "approved" : "rejected"}`,
    data: {
      agent_wallet_address: agent.wallet_address,
      agent_name: agent.agent_name,
      is_approved: agent.is_approved,
      kyc_status: agent.kyc_status
    }
  });
});

export {
  verifyCompanyAccess ,
  getAgents ,    
  updateAgentApproval
};