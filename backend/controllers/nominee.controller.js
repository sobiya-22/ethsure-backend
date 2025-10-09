import Nominee from "../models/nominee.model.js";
import Customer from "../models/customer.model.js";
import Policy from "../models/policy.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add a nominee for a policy
const addNominee = asyncHandler(async (req, res) => {
  const { nominee_name, nominee_age, nominee_email, customer_id, policy_id } = req.body;

  if (!nominee_name || !nominee_age || !nominee_email || !customer_id || !policy_id) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const customer = await Customer.findById(customer_id);
  const policy = await Policy.findById(policy_id);

  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  if (!policy) return res.status(404).json({ success: false, message: "Policy not found" });

  // Create nominee
  const nominee = await Nominee.create({
    nominee_name,
    nominee_age,
    nominee_email,
    customer: customer._id,
    policy: policy._id,
  });

  // Update customer and policy references
  // customer.nominees.push(nominee._id);
  // await customer.save();

  policy.nominee = nominee._id;
  await policy.save();

  res.status(201).json({
    success: true,
    message: "Nominee added successfully",
    data: nominee
  });
});

export {addNominee}