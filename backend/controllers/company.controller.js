import { asyncHandler } from "../utils/asyncHandler.js";
import Agent from "../models/agent.model.js";

// Approve an agent's association request
const approveAgent = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;
  if (!agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address is required"
    });
  }

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address.toLowerCase() });
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  // Find the latest pending association request
  const request = agent.association_requests?.find(r => r.status === "pending");
  if (!request) {
    return res.status(404).json({
      success: false,
      message: "No pending association request found"
    });
  }

  // Approve the request
  request.status = "approved";
  request.response_date = new Date();
  agent.is_approved = true;

  await agent.save();

  res.status(200).json({
    success: true,
    message: "Agent association approved successfully",
    data: {
      agent_wallet_address: agent.wallet_address,
      agent_name: agent.agent_name,
      is_approved: agent.is_approved,
      association_request: request
    }
  });
});

// Reject an agent's association request
const rejectAgent = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;

  if (!agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address is required"
    });
  }

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address.toLowerCase() });
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  const request = agent.association_requests?.find(r => r.status === "pending");
  if (!request) {
    return res.status(404).json({
      success: false,
      message: "No pending association request found"
    });
  }

  // Reject the request
  request.status = "rejected";
  request.response_date = new Date();
  agent.is_approved = false;

  await agent.save();

  res.status(200).json({
    success: true,
    message: "Agent association rejected",
    data: {
      agent_wallet_address: agent.wallet_address,
      agent_name: agent.agent_name,
      is_approved: agent.is_approved,
      association_request: request
    }
  });
});

// Get all pending association requests
const getPendingAgentRequests = asyncHandler(async (req, res) => {
  const pendingAgents = await Agent.find({
    "association_requests.status": "pending"
  });

  res.status(200).json({
    success: true,
    count: pendingAgents.length,
    data: pendingAgents
  });
});

export {
  approveAgent,
  rejectAgent,
  getPendingAgentRequests
};
