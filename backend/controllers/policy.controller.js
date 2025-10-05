import { asyncHandler } from "../utils/asyncHandler.js";
import Policy from "../models/policy.model.js";
import Company from "../models/company.model.js";

// Create a new policy
const createPolicy = asyncHandler(async (req, res) => {
    const {
        company_wallet_address,
        policy_name,
        policy_type,
        description,
        coverage_amount,
        premium_amount,
        premium_frequency,
        policy_duration,
        eligibility_criteria,
        terms_and_conditions
    } = req.body;

    // Validate required fields
    if (!company_wallet_address || !policy_name || !policy_type || !description || 
        !coverage_amount || !premium_amount || !policy_duration || !terms_and_conditions) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be provided"
        });
    }

    // Find company by wallet address
    const company = await Company.findOne({ 
        wallet_address: company_wallet_address.toLowerCase() 
    });

    if (!company) {
        return res.status(404).json({
            success: false,
            message: "Company not found"
        });
    }

    const newPolicy = new Policy({
        company: company._id,
        policy_id : `POL_${Date.now()}`,
        policy_name,
        policy_type,
        description,
        coverage_amount,
        premium_amount,
        premium_frequency: premium_frequency || "monthly",
        policy_duration,
        eligibility_criteria: eligibility_criteria || {},
        terms_and_conditions
    });

    await newPolicy.save();

    res.status(201).json({
        success: true,
        message: "Policy created successfully",
        data: newPolicy
    });
});

// Get all active policies for a company
const getCompanyPolicies = asyncHandler(async (req, res) => {
    const { company_wallet_address } = req.body;

    if (!company_wallet_address) {
        return res.status(400).json({
            success: false,
            message: "Company wallet address is required"
        });
    }

    const company = await Company.findOne({ 
        wallet_address: company_wallet_address.toLowerCase() 
    });

    if (!company) {
        return res.status(404).json({
            success: false,
            message: "Company not found"
        });
    }

    const policies = await Policy.find({ 
        company: company._id, 
        is_active: true 
    }).populate('company', 'company_name');

    res.status(200).json({
        success: true,
        data: policies
    });
});

// Get all active policies (for customers to browse)
const getAllActivePolicies = asyncHandler(async (req, res) => {
    const { policy_type, min_coverage, max_coverage } = req.query;

    let filter = { is_active: true };

    // Add filters if provided
    if (policy_type) {
        filter.policy_type = policy_type;
    }
    if (min_coverage) {
        filter.coverage_amount = { ...filter.coverage_amount, $gte: Number(min_coverage) };
    }
    if (max_coverage) {
        filter.coverage_amount = { ...filter.coverage_amount, $lte: Number(max_coverage) };
    }

    const policies = await Policy.find(filter)
        .populate('company', 'company_name wallet_address')
        .sort({ created_date: -1 });

    res.status(200).json({
        success: true,
        data: policies
    });
});

// Get policy by ID
const getPolicyById = asyncHandler(async (req, res) => {
    const { policy_id } = req.params;

    const policy = await Policy.findOne({ policy_id })
        .populate('company', 'company_name wallet_address');

    if (!policy) {
        return res.status(404).json({
            success: false,
            message: "Policy not found"
        });
    }

    res.status(200).json({
        success: true,
        data: policy
    });
});

// Update policy
const updatePolicy = asyncHandler(async (req, res) => {
    const { policy_id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.policy_id;
    delete updateData.company;
    delete updateData.created_date;

    const policy = await Policy.findOneAndUpdate(
        { policy_id },
        updateData,
        { new: true, runValidators: true }
    ).populate('company', 'company_name');

    if (!policy) {
        return res.status(404).json({
            success: false,
            message: "Policy not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Policy updated successfully",
        data: policy
    });
});

// Deactivate policy (soft delete)
const deactivatePolicy = asyncHandler(async (req, res) => {
    const { policy_id } = req.params;

    const policy = await Policy.findOneAndUpdate(
        { policy_id },
        { is_active: false },
        { new: true }
    );

    if (!policy) {
        return res.status(404).json({
            success: false,
            message: "Policy not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Policy deactivated successfully",
        data: policy
    });
});

export {
    createPolicy,
    getCompanyPolicies,
    getAllActivePolicies,
    getPolicyById,
    updatePolicy,
    deactivatePolicy
};