import { asyncHandler } from "../utils/asyncHandler.js";
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
        data: policy
    });
});

// Update the single policy
const updatePolicy = asyncHandler(async (req, res) => {
    const updateData = req.body;

    const policy = await Policy.findOneAndUpdate({}, updateData, {
        new: true,
        runValidators: true
    });

    if (!policy) {
        return res.status(404).json({
            success: false,
            message: "No policy found to update."
        });
    }

    res.status(200).json({
        success: true,
        message: "Policy updated successfully.",
        data: policy
    });
});

// Deactivate the  policy
const deactivatePolicy = asyncHandler(async (req, res) => {
    const policy = await Policy.findOneAndUpdate(
        {},
        { is_active: false, status: "cancelled" },
        { new: true }
    );

    if (!policy) {
        return res.status(404).json({
            success: false,
            message: "No policy found to deactivate."
        });
    }

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