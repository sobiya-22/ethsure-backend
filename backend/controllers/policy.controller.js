import { asyncHandler } from "../utils/asyncHandler.js";
import Policy from "../models/policy.model.js";
import Customer from "../models/customer.model.js"
import Agent from "../models/agent.model.js"

const createPolicy = asyncHandler(async (req, res) => {
  const {
    customerId,
    agentId,
    customer_wallet,
    agent_wallet,
    issueDate,
    expiryDate,
    fullName,
    dateOfBirth,
    gender,
    maritalStatus,
    phone,
    email,
    address,
    aadharNumber,
    panNumber,
    annualIncome,
    occupation,
    coverage_amount,
    premium_amount,
    premium_frequency,
    policy_duration,
  } = req.body;

  // Find customer by ID or wallet address
  let customer;
  if (customerId) {
    customer = await Customer.findById(customerId);
  } else if (customer_wallet) {
    customer = await Customer.findOne({ wallet_address: customer_wallet.toLowerCase() });
  } else {
    return res.status(400).json({ success: false, message: "Customer ID or wallet address is required" });
  }
  
  if (!customer)
    return res.status(404).json({ success: false, message: "Customer not found" });

  // Find agent by ID or wallet address
  let agent;
  if (agentId) {
    agent = await Agent.findById(agentId);
  } else if (agent_wallet) {
    agent = await Agent.findOne({ wallet_address: agent_wallet.toLowerCase() });
  } else {
    return res.status(400).json({ success: false, message: "Agent ID or wallet address is required" });
  }
  
  if (!agent)
    return res.status(404).json({ success: false, message: "Agent not found" });

  // Generate unique policy ID to avoid duplicate key error
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substr(2, 9);
  const randomNum = Math.floor(Math.random() * 10000);
  const policyId = `POL_${timestamp}_${randomStr}_${randomNum}`;

// Try to find existing policy with null policy_id and update it, or create new one
const existingPolicy = await Policy.findOne({ policy_id: null });
if (existingPolicy) {
  // Update existing policy
  Object.assign(existingPolicy, {
    customer: customer._id,
    agent: agent._id,
    issueDate,
    expiryDate,
    fullName,
    dateOfBirth,
    gender,
    maritalStatus,
    phone,
    email,
    address,
    aadharNumber,
    panNumber,
    annualIncome,
    occupation,
    coverage_amount,
    premium_amount,
    premium_frequency,
    policy_duration,
    status: "created",
  });
  await existingPolicy.save();
  var newPolicy = existingPolicy;
} else {
  // Create new policy without policy_id
  var newPolicy = await Policy.create({
    customer: customer._id,
    agent: agent._id,
    issueDate,
    expiryDate,
    fullName,
    dateOfBirth,
    gender,
    maritalStatus,
    phone,
    email,
    address,
    aadharNumber,
    panNumber,
    annualIncome,
    occupation,
    coverage_amount,
    premium_amount,
    premium_frequency,
    policy_duration,
    status: "created",
  });
}

  res.status(201).json({
    success: true,
    message: "Policy created successfully (status: created)",
    policy: newPolicy,
  });
});

// //get all policies
// // GET /api/policy/all-policies?customerId=671208c364e31d00239c21b0
// // GET /api/policy/all-policies?agentId=671209d564e31d00239c21c3
// // GET /api/policy/all-policies?status=active
const getPolicies = asyncHandler(async (req, res) => {
  const { customer_wallet, agent_wallet, status } = req.query;

  // Build dynamic filter
  const filter = {};

  // Filter by customer wallet
  if (customer_wallet) {
    const customer = await Customer.findOne({
      wallet_address: customer_wallet.toLowerCase(),
    });
    if (!customer)
      return res.status(404).json({
        success: false,
        message: "Customer not found with this wallet address.",
      });
    filter.customer = customer._id;
  }

  // Filter by agent wallet
  if (agent_wallet) {
    const agent = await Agent.findOne({
      wallet_address: agent_wallet.toLowerCase(),
    });
    if (!agent)
      return res.status(404).json({
        success: false,
        message: "Agent not found with this wallet address.",
      });
    filter.agent = agent._id;
  }

  // Filter by status
  if (status) filter.status = status;

  const policies = await Policy.find(filter)
    .populate("customer", "customer_name customer_email wallet_address")
    .populate("agent", "agent_name agent_email wallet_address")
    .populate("nominee", "nominee_name nominee_relation nominee_email");

  if (!policies.length) {
    return res.status(404).json({
      success: false,
      message: "No policies found for the given filters.",
    });
  }

  res.status(200).json({
    success: true,
    total: policies.length,
    policies,
  });
});

//get only one specific policy by ID
// http://localhost:5000/api/policy/${id}
const getPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const policy = await Policy.findById(id)
        .populate("customer", "customer_name customer_email wallet_address")
        .populate("agent", "agent_name agent_email wallet_address")
        .populate("nominee", "nominee_name nominee_relation");

    if (!policy)
        return res.status(404).json({ success: false, message: "Policy not found" });

    res.status(200).json({ success: true, policy });
});

//update policy
// agnet call updates from created to ongoing
// company from ongoing to active 
// any entity can change its status to newStatus passed 
const updatePolicyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newStatus, wallet_address, role } = req.body;

  // Fetch policy and populate wallet addresses
  const policy = await Policy.findById(id)
    .populate("customer", "wallet_address")
    .populate("agent", "wallet_address");

    console.log("Agent in policy:", policy.agent);
    console.log("Wallet from request:", wallet_address);

  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }

  const currentStatus = policy.status;

  // Define valid transitions per role
  const transitions = {
    customer: { from: null, to: ["created"] }, // Customer creates policy
    agent: { from: "created", to: ["ongoing", "cancelled"] },
    company: { from: "ongoing", to: ["active", "cancelled"] },
  };

  // Validate role
  if (!["customer", "agent", "company"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  // Validate transition logic
  const validFrom = transitions[role].from;
  const validTo = transitions[role].to;

  if (validFrom && currentStatus !== validFrom) {
    return res.status(400).json({
      success: false,
      message: `Role '${role}' cannot update policy from '${currentStatus}'`,
    });
  }

  if (!validTo.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${newStatus}' for role '${role}'`,
    });
  }

  //  Validate wallet ownership (safe null-checks)
  if (
    role === "agent" &&
    (!policy.agent || policy.agent.wallet_address !== wallet_address)
  ) {
    return res.status(403).json({ success: false, message: "Unauthorized agent" });
  }

  if (
    role === "customer" &&
    (!policy.customer || policy.customer.wallet_address !== wallet_address)
  ) {
    return res.status(403).json({ success: false, message: "Unauthorized customer" });
  }

  // ✅ Update status
  policy.status = newStatus;
  await policy.save();

  return res.status(200).json({
    success: true,
    message: `Policy status updated to '${newStatus}' by ${role}`,
    policy,
  });
});

export {
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicyStatus
};