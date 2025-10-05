// try {
//     const txHash = await registerAgentOnChain(company_did, agent.agent_did, vc_hash);
//     console.log("Agent registered on-chain:", txHash);

//     return res.status(200).json({
//       success: true,
//       message: "KYC completed and agent registered on blockchain",
//       user: agent,
//       txHash,
//     });
//   } catch (err) {
//     console.error("Blockchain registration failed:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "KYC saved but blockchain registration failed",
//       error: err.message,
//     });
//   }

// make changes and additions below ---above file remains as it is 

import { asyncHandler } from "../utils/asyncHandler.js";
import Agent from "../models/agent.model.js";
import PolicyRequest from "../models/policyRequest.model.js"; 

const getAgent = asyncHandler(async (req, res) => {
  const { wallet_address } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ 
      success: false, 
      message: "Wallet address is required" });
  }
  // normalize for safety
  const agent = await Agent.findOne({ 
    wallet_address: wallet_address.toLowerCase() 
  });
  
  if (!agent) {
    return res.status(404).json({ 
      success: false, 
      message: "Agent not found" });
  }
  res.status(200).json({ 
    success: true, 
    data: agent });
});

// update agent
const updateAgent = asyncHandler(async (req, res) => {

  const { wallet_address, updateData } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ 
      success: false, 
      message: "Wallet address is required" });
  }

  const agent = await Agent.findOneAndUpdate(
    { wallet_address: wallet_address.toLowerCase() },
    updateData,
    { new: true } 
  );

  if (!agent) {
    return res.status(404).json({ 
      success: false, 
      message: "Agent not found" 
    });
  }

  res.status(200).json({ 
    success: true, 
    data: agent 
  });
});


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

// ✅ Get all approved agents (visible to customers too)
const getApprovedAgents = asyncHandler(async (req, res) => {
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

// ✅ Get all agents (categorized) — no company check here
const getAllAgents = asyncHandler(async (req, res) => {
  const allAgents = await Agent.find({})
    .populate("user", "email")
    .lean();

  const categorized = {
    pending_kyc: allAgents.filter(a => a.kyc_status === "pending"),
    pending_approval: allAgents.filter(
      a => a.kyc_status === "verified" && !a.is_approved
    ),
    approved: allAgents.filter(
      a => a.kyc_status === "verified" && a.is_approved
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

//Agent sends association request (after KYC)
const sendAssociationRequest = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;

  if (!agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address is required",
    });
  }

  const agent = await Agent.findOne({
    wallet_address: agent_wallet_address.toLowerCase(),
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found",
    });
  }

  if (agent.kyc_status !== "verified") {
    return res.status(400).json({
      success: false,
      message: "KYC must be verified before sending association request",
    });
  }

  if (agent.is_approved) {
    return res.status(400).json({
      success: false,
      message: "Agent is already approved",
    });
  }

  if (!company.pending_agents) company.pending_agents = [];

  const alreadyRequested = company.pending_agents.includes(
    agent_wallet_address.toLowerCase()
  );

  if (alreadyRequested) {
    return res.status(400).json({
      success: false,
      message: "Association request already sent",
    });
  }

  company.pending_agents.push(agent_wallet_address.toLowerCase());
  await company.save();

  res.status(200).json({
    success: true,
    message: "Association request sent to company",
  });
});

// Get policy requests for agent
const getAgentRequests = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;

  if (!agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address is required"
    });
  }

  const agent = await Agent.findOne({ 
    wallet_address: agent_wallet_address.toLowerCase() 
  });
  
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  const requests = await PolicyRequest.find({ agent: agent._id })
    .populate('customer', 'customer_name customer_email customer_phone')
    .populate('policy', 'policy_name policy_type coverage_amount premium_amount')
    .sort({ request_date: -1 });

  res.status(200).json({
    success: true,
    data: requests
  });
});

// Approve policy request
const approveRequest = asyncHandler(async (req, res) => {
  const { agent_wallet_address, request_id, response_message } = req.body;

  if (!agent_wallet_address || !request_id) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address and request ID are required"
    });
  }

  // Find agent
  const agent = await Agent.findOne({ 
    wallet_address: agent_wallet_address.toLowerCase() 
  });
  
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  // Find and update policy request
  const policyRequest = await PolicyRequest.findOneAndUpdate(
    { 
      request_id: request_id,
      agent: agent._id,
      status: "pending"
    },
    {
      status: "approved",
      agent_response: {
        message: response_message || "Request approved",
        response_date: new Date()
      }
    },
    { new: true }
  ).populate([
    { path: 'customer', select: 'customer_name customer_email' },
    { path: 'policy', select: 'policy_name policy_type coverage_amount premium_amount' }
  ]);

  if (!policyRequest) {
    return res.status(404).json({
      success: false,
      message: "Pending policy request not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Policy request approved successfully",
    data: policyRequest
  });
});

// Reject policy request
const rejectRequest = asyncHandler(async (req, res) => {
  const { agent_wallet_address, request_id, response_message } = req.body;

  if (!agent_wallet_address || !request_id) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address and request ID are required"
    });
  }

  // Find agent
  const agent = await Agent.findOne({ 
    wallet_address: agent_wallet_address.toLowerCase() 
  });
  
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  // Find and update policy request
  const policyRequest = await PolicyRequest.findOneAndUpdate(
    { 
      request_id: request_id,
      agent: agent._id,
      status: "pending"
    },
    {
      status: "rejected",
      agent_response: {
        message: response_message || "Request rejected",
        response_date: new Date()
      }
    },
    { new: true }
  ).populate([
    { path: 'customer', select: 'customer_name customer_email' },
    { path: 'policy', select: 'policy_name policy_type coverage_amount premium_amount' }
  ]);

  if (!policyRequest) {
    return res.status(404).json({
      success: false,
      message: "Pending policy request not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Policy request rejected successfully",
    data: policyRequest
  });
});

export {getAgent , updateAgent , getAllAgents , getPendingAgents , getApprovedAgents , sendAssociationRequest, getAgentRequests, approveRequest, rejectRequest }