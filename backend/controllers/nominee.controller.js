import Nominee from "../models/nominee.model.js";
import Customer from "../models/customer.model.js";
import Policy from "../models/policy.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add Nominee 
const addNominee = asyncHandler(async (req, res) => {
  const { nominee_name, nominee_age, nominee_email, customer_id, policy_id } = req.body;

  if (!nominee_name || !nominee_age || !nominee_email || !customer_id || !policy_id) {
    return res.status(400).json({
      success: false,
      message: "All nominee fields and references are required"
    });
  }

  const customer = await Customer.findById(customer_id);
  const policy = await Policy.findById(policy_id);

  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  if (!policy) return res.status(404).json({ success: false, message: "Policy not found" });

  const nominee = await Nominee.create({
    nominee_name,
    nominee_age,
    nominee_email,
    customer: customer._id,
    policy: policy._id,
  });

  customer.nominees.push(nominee._id);
  await customer.save();

  policy.nominee = nominee._id;
  await policy.save();

  res.status(201).json({
    success: true,
    message: "Nominee added successfully",
    data: nominee
  });
});

// Get Nominees 
const getNominees = asyncHandler(async (req, res) => {
  const { customer_id, policy_id } = req.query;

  const filter = {};
  if (customer_id) filter.customer = customer_id;
  if (policy_id) filter.policy = policy_id;

  const nominees = await Nominee.find(filter)
    .populate("customer", "customer_name wallet_address")
    .populate("policy", "fullName status");

  if (!nominees.length) {
    return res.status(404).json({
      success: false,
      message: "No nominees found"
    });
  }

  res.status(200).json({
    success: true,
    total: nominees.length,
    data: nominees
  });
});

// Update Nominee 
const updateNominee = asyncHandler(async (req, res) => {
  const { nominee_id, updateData } = req.body;

  if (!nominee_id || !updateData) {
    return res.status(400).json({
      success: false,
      message: "Nominee ID and update data are required"
    });
  }

  const nominee = await Nominee.findByIdAndUpdate(
    nominee_id,
    updateData,
    { new: true }
  )
  .populate("customer", "customer_name wallet_address")
  .populate("policy", "fullName status");

  if (!nominee) {
    return res.status(404).json({
      success: false,
      message: "Nominee not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Nominee updated successfully",
    data: nominee
  });
});

export { addNominee, getNominees, updateNominee };
