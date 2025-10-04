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

export {getAgent , updateAgent}