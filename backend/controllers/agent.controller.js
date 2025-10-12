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
import Policy from "../models/policy.model.js"
import Company from "../models/company.model.js";


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

//policies that are awaiting their approval
const getPolicyRequests = asyncHandler(async (req, res) => {
  const { wallet_address } = req.body;

  if (!wallet_address)
    return res.status(400).json({ success: false, message: "Wallet address is required" });

  // Find the agent using wallet address
  const agent = await Agent.findOne({ wallet_address: wallet_address.toLowerCase() });
  if (!agent)
    return res.status(404).json({ success: false, message: "Agent not found" });

  // Fetch policies assigned to this agent with status = "created"
  const policies = await Policy.find({
    agent: agent._id,
    status: "created"
  })
    .populate("customer", "customer_name wallet_address")
    .populate("agent", "agent_name wallet_address");

  if (policies.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No pending policy requests found for this agent.",
      data: []
    });
  }

  res.status(200).json({
    success: true,
    message: "Pending policy requests fetched successfully.",
    data: policies
  });
});

// //For agents to approve, reject, or mark as ongoing.
// const updatePolicyStatus = asyncHandler(async (req, res) => {
//     const { policy_id, status } = req.body;

//     if (!policy_id || !status) {
//         return res.status(400).json({
//             success: false,
//             message: "Policy ID and status are required."
//         });
//     }

//     const policy = await Policy.findOne({ policy_id });
//     if (!policy) {
//         return res.status(404).json({ success: false, message: "Policy not found" });
//     }

//     policy.status = status;
//     await policy.save();

//     res.status(200).json({
//         success: true,
//         message: `Policy status updated to ${status}`,
//         data: policy
//     });
// });

//list of all policies
const getAllAgentPolicies = asyncHandler(async (req, res) => {
  const { wallet_address } = req.body;

  if (!wallet_address)
    return res.status(400).json({ success: false, message: "Wallet address is required" });

  const agent = await Agent.findOne({ wallet_address: wallet_address.toLowerCase() });
  if (!agent)
    return res.status(404).json({ success: false, message: "Agent not found" });

  // Fetch all policies linked to this agent
  const policies = await Policy.find({ agent: agent._id })
    .populate("customer", "customer_name wallet_address")
    .populate("agent", "agent_name wallet_address");

  if (policies.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No policies found for this agent.",
      data: []
    });
  }

  res.status(200).json({
    success: true,
    message: "All policies for this agent fetched successfully.",
    data: policies
  });
});

const sendAssociationRequest = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;

  if (!agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address is required",
    });
  }

  const agent = await Agent.findOne({ wallet_address: agent_wallet_address.toLowerCase() });

  if (!agent) return res.status(404).json({ 
    success: false, 
    message: "Agent not found" 
  });

  if (agent.kyc_status !== "verified") {
    return res.status(400).json({
      success: false,
      message: "KYC must be verified before sending an association request",
    });
  }

  //Fetch company
  const company = await Company.findOne();
  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Nocompany found in the system",
    });
  }

  //Check if already sent
  const existingRequest = agent.association_requests.find(
    (req) => req.associated_company?.toString() === company._id.toString()
  );

  if (existingRequest) {
    return res.status(400).json({
      success: false,
      message: `Association request already ${existingRequest.status} for this company.`,
    });
  }

  //Add new association request
  agent.association_requests.push({
    associated_company: company._id,
    status: "pending",
    request_date: new Date(),
  });

  await agent.save();

  res.status(200).json({
    success: true,
    message: "Association request sent to company successfully.",
    data: {
      agent_wallet_address: agent.wallet_address,
      company_wallet_address: company.wallet_address,
      status: "pending",
    },
  });
});


export {getAgent , updateAgent, getAllAgentPolicies , getPolicyRequests , sendAssociationRequest }
