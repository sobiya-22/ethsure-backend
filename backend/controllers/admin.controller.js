import { asyncHandler } from "../utils/asyncHandler.js";
import Agent from "../models/agent.model.js";
import User from "../models/user.model.js";

// Get pending agent KYCs
const getPendingAgentKYCs = asyncHandler(async (req, res) => {
  const pendingAgents = await Agent.find({ kyc_status: "pending" }).populate("user");
  return res.status(200).json({ success: true, data: pendingAgents });
});

// Approve an agent (admin-only endpoint)
const approveAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const agent = await Agent.findById(agentId).populate("user");
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

  agent.kyc_status = "verified";
  agent.is_approved = true;
  await agent.save();

  if (agent.user) {
    const user = await User.findById(agent.user._id);
    user.kyc_completed = true;
    await user.save();
  }

  return res.status(200).json({ success: true, message: "Agent approved", agent });
});

// Reject agent
const rejectAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { reason } = req.body;
  const agent = await Agent.findById(agentId).populate("user");
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

  agent.kyc_status = "rejected";
  agent.is_approved = false;
 
  await agent.save();

  return res.status(200).json({ success: true, message: "Agent rejected", agent });
});

export { getPendingAgentKYCs, approveAgent, rejectAgent };
