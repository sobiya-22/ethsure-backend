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

//Get list of agents waiting for approval (KYC verified but not approved)
const getPendingAgents = asyncHandler(async (req, res) => {
  const { company_wallet_address } = req.body;

  if (!company_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Company wallet address is required"
    });
  }

  // Verify company access
  const { valid, message } = await verifyCompanyAccess(company_wallet_address);
  if (!valid) {
    return res.status(403).json({ 
      success: false, 
      message 
    });
  }

  // Find agents with verified KYC but not approved yet
  const pendingAgents = await Agent.find({
    kyc_status: "verified",
    is_approved: false
  }).populate("user", "email");

  res.status(200).json({
    success: true,
    count: pendingAgents.length,
    data: pendingAgents
  });
});

//Get list of approved agents
const getApprovedAgents = asyncHandler(async (req, res) => {

  const { company_wallet_address } = req.body;

  if (!company_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Company wallet address is required"
    });
  }

  // Verify company access
  const { valid, message } = await verifyCompanyAccess(company_wallet_address);
  if (!valid) {
    return res.status(403).json({ success: false, message });
  }

  // Find approved agents
  const approvedAgents = await Agent.find({
    kyc_status: "verified",
    is_approved: true
  }).populate("user", "email");

  res.status(200).json({
    success: true,
    count: approvedAgents.length,
    data: approvedAgents
  });
});

//Get all agents with their verification status
const getAllAgents = asyncHandler(async (req, res) => {
  const { company_wallet_address } = req.body;

  if (!company_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Company wallet address is required"
    });
  }
  // Verify company access
  const { valid, message } = await verifyCompanyAccess(company_wallet_address);
  if (!valid) {
    return res.status(403).json({ success: false, message });
  }
  // Get all agents
  const allAgents = await Agent.find({})
    .populate("user", "email")
    .lean();

  // Categorize agents
  const categorized = {
    pending_kyc: allAgents.filter(a => a.kyc_status === "pending"),

    pending_approval: allAgents.filter(a => 
      a.kyc_status === "verified" && !a.is_approved
    ),

    approved: allAgents.filter(a => 
      a.kyc_status === "verified" && a.is_approved
    )
  };

  res.status(200).json({
    success: true,
    total: allAgents.length,
    counts: {
      pending_kyc: categorized.pending_kyc.length,
      pending_approval: categorized.pending_approval.length,
      approved: categorized.approved.length
    },
    data: categorized
  });
});

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
  getPendingAgents,
  getApprovedAgents,
  getAllAgents,
  approveAgent,
  rejectAgent
};