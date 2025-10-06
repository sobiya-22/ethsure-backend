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

// Get list of agents waiting for approval (KYC verified but not approved)
const getPendingAgents = asyncHandler(async (req, res) => {
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

// Get list of approved agents
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

// Get all agents with their verification status
const getAllAgents = asyncHandler(async (req, res) => {
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

const getAgentPolicyRequests = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;

  if (!agent_wallet_address) {
    return res.status(400).json({ success: false, message: "Agent wallet address is required" });
  }

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address });
  if (!agent) {
    return res.status(404).json({ success: false, message: "Agent not found" });
  }

  res.status(200).json({
    success: true,
    count: agent.policy_requests.length,
    requests: agent.policy_requests
  });
});

const approvePolicyRequest = asyncHandler(async (req, res) => {
  const { 
    agent_wallet_address, 
    customer_wallet_address, 
    policy_id 
  } = req.body;

  if (!agent_wallet_address || !customer_wallet_address || !policy_id) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields are required" 
    });
  }

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address });
  if (!agent) return res.status(404).json({ 
    success: false, 
    message: "Agent not found" 
  });

  // Find the specific request
  const request = agent.policy_requests.find(
    r => r.customer_wallet_address === customer_wallet_address && r.policy_id === policy_id
  );

  if (!request) return res.status(404).json({        success: false, 
    message: "Request not found" 
  });

  // Update request status
  request.status = "approved";
  request.response_date = new Date();

  await agent.save();

  res.status(200).json({
    success: true,
    message: "Policy request approved",
    request
  });
});

const rejectPolicyRequest = asyncHandler(async (req, res) => {
  const { agent_wallet_address, customer_wallet_address, policy_id } = req.body;

  if (!agent_wallet_address || !customer_wallet_address || !policy_id) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields are required" 
    });
  }

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address });
  if (!agent) return res.status(404).json({ 
    success: false, 
    message: "Agent not found" 
  });

  const request = agent.policy_requests.find(
    r => r.customer_wallet_address === customer_wallet_address && r.policy_id === policy_id
  );

  if (!request) return res.status(404).json({ 
    success: false, 
    message: "Request not found" 
  });

  // Update request status
  request.status = "rejected";
  request.response_date = new Date();

  await agent.save();

  res.status(200).json({
    success: true,
    message: "Policy request rejected",
    request
  });
});

const sendAssociationRequest = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;

  if (!agent_wallet_address) {
    return res.status(400).json({ success: false, message: "Agent wallet address is required" });
  }

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address });
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

  // Initialize array if not present
  agent.association_requests = agent.association_requests || [];
  agent.association_requests.push({
    status: "pending",
    request_date: new Date()
  });

  await agent.save();

  res.status(200).json({
    success: true,
    message: "Association request sent successfully to the company",
    requests: agent.association_requests
  });
});

export {getAgent , updateAgent , getAllAgents , getApprovedAgents, getPendingAgents , getAgentPolicyRequests , approvePolicyRequest , rejectPolicyRequest , sendAssociationRequest}