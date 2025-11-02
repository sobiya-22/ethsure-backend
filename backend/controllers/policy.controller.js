import { asyncHandler } from "../utils/asyncHandler.js";
import Policy from "../models/policy.model.js";
import Customer from "../models/customer.model.js"
import Agent from "../models/agent.model.js"
import { wallet } from "../blockchain/config.js";


const createPolicy = asyncHandler(async (req, res) => {
  const {
    customer_wallet_address,
    agent_wallet_address,
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
    policy_duration = 10,
  } = req.body;
  console.log(req.body);
  if (!customer_wallet_address || !agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Customer and agent wallet addresses are required"
    });
  }
  // console.log(customer_wallet_address);
  const customer = await Customer.findOne({
    wallet_address: { $regex: `^${customer_wallet_address}$`, $options: "i" }
  });
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found with the provided wallet address"
    });
  }

  const agent = await Agent.findOne({
    wallet_address: agent_wallet_address,
    is_approved: true
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found or not approved with the provided wallet address"
    });
  }
  const dob = new Date(dateOfBirth);
  const age = new Date().getFullYear() - dob.getFullYear();
  if (age < 18) {
    return res.status(400).json({
      success: false,
      message: "Customer must be at least 18 years old"
    });
  }

  // Create the policy
  const newPolicy = await Policy.create({
    customer: customer._id,      // ✅ ADD THIS
    agent: agent._id,
    customer_wallet_address: customer_wallet_address,
    agent_wallet_address: agent_wallet_address,
    fullName,
    dateOfBirth,
    gender,
    maritalStatus,
    phone,
    email,
    address,
    aadharNumber,
    panNumber,
    annualIncome: parseInt(annualIncome),
    occupation,
    coverage_amount: parseInt(coverage_amount) || 1000000,
    premium_amount: parseInt(premium_amount) || 50000,
    premium_frequency,
    policy_duration: 10,
    status: "created",
  });

  // Update customer's policy count
  await Customer.findOneAndUpdate(
    { wallet_address: customer_wallet_address },
    {
      $inc: { policy_count: 1 }
    }
  );

  res.status(201).json({
    success: true,
    message: "Policy created successfully",
    policy: {
      ...newPolicy.toObject(),
      policy_number: newPolicy._id.toString()
    },
  });
});


// //get all policies
// // GET /api/policy/all-policies?customerId=671208c364e31d00239c21b0
// // GET /api/policy/all-policies?agentId=671209d564e31d00239c21c3
// // GET /api/policy/all-policies?status=active

const getPolicies = asyncHandler(async (req, res) => {
  const { customer_wallet_address, agent_wallet_address, status } = req.query;
  console.log("Received query:", req.query);

  const filter = {};

  if (customer_wallet_address) {
    filter.customer_wallet_address = customer_wallet_address;
  }

  if (agent_wallet_address) {
    filter.agent_wallet_address = agent_wallet_address;
  }

  if (status) filter.status = status;

  console.log("Filter being applied:", filter);

  const policies = await Policy.find(filter)
    .populate('customer')
    .populate('agent');

  console.log("Policies found:", policies.length);

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
  if (!id) return res.status(404).json({ success: false, message: "Policy ID is required!" });

  if (!wallet_address || !role || !newStatus) {
    return res.status(404).json({ success: false, message: "Wallet addr,role and new status is required!" });
  }

  const policy = await Policy.findById(id)

  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }

  const currentStatus = policy.status;

  // Define valid transitions per role
  const transitions = {
    customer: { from: null, to: ["created"] }, // Customer creates policy
    agent: { from: "created", to: ["agentApproved", "cancelled"] },
    company: { from: "agentApproved", to: ["active", "cancelled"] },
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
      message: `Invalid status ${newStatus} for role '${role}'`,
    });
  }

  if (
    role === "agent" &&
    (policy.agent_wallet_address !== wallet_address)
  ) {
    return res.status(403).json({ success: false, message: "Unauthorized agent" });
  }

  if (
    role === "customer" &&
    (policy.customer_wallet_address !== wallet_address)
  ) {
    return res.status(403).json({ success: false, message: "Unauthorized customer" });
  }

  policy.status = newStatus;
  await policy.save();

  return res.status(200).json({
    success: true,
    message: `Policy status updated to ${newStatus} by ${role}`,
    policy,
  });
});


export {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicyStatus
};