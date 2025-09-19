import { asyncHandler } from "../utils/asyncHandler.js";
import Agent from "../models/agent.model.js";
import User from "../models/user.model.js";

// agent submits KYC (status pending). Admin verifies later.
const submitAgentKYC = asyncHandler(async (req, res) => {
  let { wallet_address, agent_name, agent_email, agent_phone, license_number, profile_photo_url } = req.body;
  if (!wallet_address) return res.status(400).json({ success: false, message: "wallet_address required" });

  wallet_address = wallet_address.toLowerCase();

  const agent = await Agent.findOneAndUpdate(
    { wallet_address },
    {
      agent_name: agent_name || "",
      agent_email: agent_email || "",
      agent_phone: agent_phone || "",
      license_number: license_number || "",
      profile_photo_url: profile_photo_url || null,
      kyc_status: "pending",
      is_approved: false
    },
    { new: true }
  );

  if (!agent) return res.status(404).json({ success: false, message: "Agent role not found; select role first" });

  // admin will set is_approved and kyc_status to verified later
  return res.status(200).json({ success: true, message: "Agent KYC submitted (pending verification)", agent });
});

const getAgent = asyncHandler(async (req, res) => {
  const { wallet_address } = req.params;
  const a = await Agent.findOne({ wallet_address: wallet_address.toLowerCase() });
  if (!a) return res.status(404).json({ success: false, message: "Agent not found" });
  res.status(200).json({ success: true, data: a });
});

const getAllAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.find();
  res.status(200).json({ success: true, data: agents });
});

// Check KYC status for agent
const checkKYCStatus = asyncHandler(async (req, res) => {
  const { wallet_address } = req.params;
  if (!wallet_address) return res.status(400).json({ success: false, message: "wallet_address required" });

  const agent = await Agent.findOne({ wallet_address });
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

  return res.status(200).json({
    success: true,
    wallet_address,
    kyc_status: agent.kyc_status,
    isApproved: agent.is_approved,
  });
});


export { submitAgentKYC, getAgent, getAllAgents , checkKYCStatus };
