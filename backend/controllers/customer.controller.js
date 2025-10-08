import { asyncHandler } from "../utils/asyncHandler.js";
import Customer from "../models/customer.model.js"; 
import Agent from "../models/agent.model.js";
import Policy from "../models/policy.model.js";

//get customer
const getCustomer = asyncHandler(async (req, res) => {

  const { wallet_address } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ 
      success: false, 
      message: "Wallet address is required" 
    });
  }

  const customer = await Customer.findOne({ wallet_address: wallet_address.toLowerCase() });

  if (!customer) {
    return res.status(404).json({ 
      success: false, 
      message: "Customer not found" });
  }

  res.status(200).json({ success: true, data: customer });
});


//update customer
const updateCustomer = asyncHandler(async (req, res) => {
  const { wallet_address, updateData } = req.body;

  if (!wallet_address) {

    return res.status(400).json({ 
      success: false, 
      message: "Wallet address is required" });
  }

  const customer = await Customer.findOneAndUpdate(
    { wallet_address: wallet_address.toLowerCase() },
    updateData,
    { new: true }
  );

  if (!customer) {
    return res.status(404).json({ 
      success: false, 
      message: "Customer not found" });
  }

  res.status(200).json({ 
    success: true, 
    data: customer });
});

// // Customer sends a policy request to an agent
// const sendPolicyRequest = asyncHandler(async (req, res) => {
//   const { customer_wallet_address, agent_wallet_address, policy_id } = req.body;

//   if (!customer_wallet_address || !agent_wallet_address || !policy_id) {
//     return res.status(400).json({
//       success: false,
//       message: "Customer wallet address, agent wallet address, and policy ID are required.",
//     });
//   }

//   const customer = await Customer.findOne({ wallet_address: customer_wallet_address });
//   if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

//   const agent = await Agent.findOne({ wallet_address: agent_wallet_address });
//   if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

//   const policy = await Policy.findOne({policy_id});
//   if (!policy) return res.status(404).json({ success: false, message: "Policy not found" });

//   // Add request to agent’s policy_requests array
//   agent.policy_requests = agent.policy_requests || [];
//   agent.policy_requests.push({
//     customer_wallet_address,
//     policy_id,
//     policy_name: policy.policy_name,
//     status: "pending",
//     request_date: new Date(),
//   });

//   await agent.save();

//   res.status(200).json({
//     success: true,
//     message: "Policy request sent successfully to the agent.",
//   });
// });

export {getCustomer , updateCustomer};
