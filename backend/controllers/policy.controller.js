import { asyncHandler } from "../utils/asyncHandler.js";
import Policy from "../models/policy.model.js";
import Customer from "../models/customer.model.js"
import Agent from "../models/agent.model.js"


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
      customer_wallet_address: customer_wallet_address.toLowerCase(),
      agent_wallet_address: agent_wallet_address.toLowerCase(),
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
      { wallet_address: customer_wallet_address.toLowerCase() },
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
    filter.customer_wallet_address = customer_wallet_address.toLowerCase();
  }

  if (agent_wallet_address) {
    filter.agent_wallet_address = agent_wallet_address.toLowerCase();
  }

  if (status) filter.status = status;

  console.log("Filter being applied:", filter);

  const policies = await Policy.find(filter);

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

  // ✅ Validate wallet ownership (safe null-checks)
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




// //Deactivate the  policy
// const deactivatePolicy = asyncHandler(async (req, res) => {
//     const policy = await Policy.findOneAndUpdate(
//         {},
//         { is_active: false, status: "cancelled" },
//         { new: true }
//     );

//     if (!policy) {
//         return res.status(404).json({
//             success: false,
//             message: "No policy found to deactivate."
//         });
//     }

//     res.status(200).json({
//         success: true,
//         message: "Policy deactivated successfully.",
//         data: policy
//     });
// });


// //Customer requests a policy with a specific agent
// const requestPolicy = asyncHandler(async (req, res) => {
//     const { customer_wallet_address, agent_wallet_address } = req.body;

//     if (!customer_wallet_address || !agent_wallet_address) {
//         return res.status(400).json({
//             success: false,
//             message: "Customer and agent wallet addresses are required."
//         });
//     }

//     const customer = await Customer.findOne({ wallet_address: customer_wallet_address.toLowerCase() });
//     if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

//     const agent = await Agent.findOne({ wallet_address: agent_wallet_address.toLowerCase() });
//     if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

//     const policy = await Policy.findOne();
//     if (!policy) return res.status(404).json({ success: false, message: "No policy found" });

//     // Update policy to "created" with refs
//     policy.customer = customer._id;
//     policy.agent = agent._id;
//     policy.status = "created";

//     await policy.save();

//     res.status(200).json({
//         success: true,
//         message: "Policy request sent successfully.",
//         data: policy
//     });
// });


export {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicyStatus
};