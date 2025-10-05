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

// Approve an agent after KYC verification
const approveAgent = asyncHandler(async (req, res) => {

  const { company_wallet_address, agent_wallet_address } = req.body;

  // Validate required fields
  if (!company_wallet_address || !agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Company wallet address and agent wallet address are required"
    });
  }

  // Verify company access
  const { valid, message } = await verifyCompanyAccess(company_wallet_address);
  if (!valid) {
    return res.status(403).json({ success: false, message });
  }

  // Find the agent
  const agent = await Agent.findOne({ 
    wallet_address: agent_wallet_address.toLowerCase() 
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  // Check if agent's KYC is verified
  if (agent.kyc_status !== "verified") {
    return res.status(400).json({
      success: false,
      message: "Agent KYC must be verified before approval"
    });
  }

  // Check if agent is already approved
  if (agent.is_approved) {
    return res.status(400).json({
      success: false,
      message: "Agent is already approved"
    });
  }

  // Approve the agent
  agent.is_approved = true;
  await agent.save();

  res.status(200).json({
    success: true,
    message: "Agent approved successfully",
    data: {
      agent_wallet_address: agent.wallet_address,
      agent_name: agent.agent_name,
      is_approved: agent.is_approved,
      kyc_status: agent.kyc_status
    }
  });
});

//Reject an agent's approval request
const rejectAgent = asyncHandler(async (req, res) => {
  const { company_wallet_address, agent_wallet_address, reason } = req.body;

  // Validate required fields
  if (!company_wallet_address || !agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Company wallet address and agent wallet address are required"
    });
  }

  // Verify company access
  const { valid, message } = await verifyCompanyAccess(company_wallet_address);
  if (!valid) {
    return res.status(403).json({ success: false, message });
  }

  // Find the agent
  const agent = await Agent.findOne({ 
    wallet_address: agent_wallet_address.toLowerCase() 
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }
  agent.is_approved = false;
  await agent.save();

  res.status(200).json({
    success: true,
    message: "Agent approval rejected",
    data: {
      agent_wallet_address: agent.wallet_address,
      agent_name: agent.agent_name,
      is_approved: agent.is_approved
    }
  });
});

export {
  verifyCompanyAccess ,
  approveAgent,
  rejectAgent
};