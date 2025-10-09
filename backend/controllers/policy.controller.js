import { asyncHandler } from "../utils/asyncHandler.js";
<<<<<<< Updated upstream
import Policy from "../models/policy.model.js";
import Customer from "../models/customer.model.js"
import Agent from "../models/agent.model.js"
// Create a single policy (only one allowed)
// const createPolicy = asyncHandler(async (req, res) => {
//     const {
//         policy_name,
//         description,
//         coverage_amount,
//         premium_amount,
//         premium_frequency,
//         policy_duration
//     } = req.body;

//     // Check if a policy already exists
//     const existingPolicy = await Policy.findOne();
//     if (existingPolicy) {
//         return res.status(400).json({
//             success: false,
//             message: "A policy already exists. Only one policy can be created."
//         });
//     }

//     if (!policy_name || !description) {
//         return res.status(400).json({
//             success: false,
//             message: "Policy name and description are required."
//         });
//     }

//     const policy_id = `POL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

//     const newPolicy = new Policy({
//         policy_id,
//         policy_name,
//         description,
//         coverage_amount,
//         premium_amount,
//         premium_frequency: premium_frequency || "annual",
//         policy_duration
//     });

//     await newPolicy.save();

//     res.status(201).json({
//         success: true,
//         message: "Policy created successfully.",
//         data: newPolicy
//     });
// });

// Get the only existing policy
const getPolicy = asyncHandler(async (req, res) => {
    const policy = await Policy.findOne();

    if (!policy) {
        return res.status(404).json({
            success: false,
            message: "No policy found."
        });
    }

    res.status(200).json({
        success: true,
        message: "Policy and nominee created successfully (status: created)",
        policy: newPolicy,
        nominee,
    });
});


//get all policies
// GET /api/policy/all-policies?customerId=671208c364e31d00239c21b0
// GET /api/policy/all-policies?agentId=671209d564e31d00239c21c3
// GET /api/policy/all-policies?status=active
export const getPolicies = asyncHandler(async (req, res) => {
    const { customerId, agentId, status } = req.query;
//above these customerId, agentId these ids are mongodb id
    const filter = {};
    if (customerId) filter.customer = customerId;
    if (agentId) filter.agent = agentId;
    if (status) filter.status = status;

    const policies = await Policy.find(filter)
        .populate("customer", "customer_name customer_email wallet_address")
        .populate("agent", "agent_name agent_email wallet_address")
        .populate("nominee", "nominee_name nominee_relation");

    res.status(200).json({ success: true, policies });
});


//get only one specific policy by ID
// http://localhost:5000/api/policy/${id}
export const getPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const policy = await Policy.findById(id)
        .populate("customer", "customer_name customer_email wallet_address")
        .populate("agent", "agent_name agent_email wallet_address")
        .populate("nominee", "nominee_name nominee_relation");

    if (!policy)
        return res.status(404).json({ success: false, message: "Policy not found" });

    res.status(200).json({ success: true, policy });
});

<<<<<<< Updated upstream
export {
    createPolicy,
    getPolicy,
    updatePolicy,
    deactivatePolicy
=======

//update policy
// agnet call updates from created to ongoing
// company from ongoing to active 
// any entity can change its status to newStatus passed 
export const updatePolicyStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    const validTransitions = {
        created: ["ongoing", "cancelled"],
        ongoing: ["active", "cancelled"],
        active: ["claimed", "cancelled"],
    };

    const policy = await Policy.findById(id);
    if (!policy)
        return res.status(404).json({ success: false, message: "Policy not found" });

    const currentStatus = policy.status;

    // Validate transition
    if (
        !validTransitions[currentStatus] ||
        !validTransitions[currentStatus].includes(newStatus)
    ) {
        return res.status(400).json({
            success: false,
            message: `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
        });
    }

    policy.status = newStatus;
    await policy.save();

    res.status(200).json({
        success: true,
        message: `Policy status updated to '${newStatus}'`,
        policy,
    });
});



// Deactivate the  policy
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

    res.status(200).json({
        success: true,
        message: "Policy deactivated successfully.",
        data: policy
    });
});

// Customer requests a policy with a specific agent
const requestPolicy = asyncHandler(async (req, res) => {
    const { customer_wallet_address, agent_wallet_address } = req.body;

    if (!customer_wallet_address || !agent_wallet_address) {
        return res.status(400).json({
            success: false,
            message: "Customer and agent wallet addresses are required."
        });
    }

    const customer = await Customer.findOne({ wallet_address: customer_wallet_address.toLowerCase() });
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const agent = await Agent.findOne({ wallet_address: agent_wallet_address.toLowerCase() });
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

    const policy = await Policy.findOne();
    if (!policy) return res.status(404).json({ success: false, message: "No policy found" });

    // Update policy to "created" with refs
    policy.customer = customer._id;
    policy.agent = agent._id;
    policy.status = "created";

    await policy.save();

    res.status(200).json({
        success: true,
        message: "Policy request sent successfully.",
        data: policy
    });
});


export {
    //createPolicy,
    getPolicy,
    updatePolicy,
    deactivatePolicy,
    requestPolicy 
};