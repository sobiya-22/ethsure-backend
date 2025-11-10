import { asyncHandler } from "../utils/asyncHandler.js";
import Policy from "../models/policy.model.js";
import Customer from "../models/customer.model.js"
import Agent from "../models/agent.model.js"
import { issuePolicyVC } from "../VC/createVC.js";
import { createPolicyOnChain, claimPolicyOnChain } from "../blockchain/policyRegistry.js";
// import { query } from "express";
const COMPANY_DID = process.env.COMPANY_DID;


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
    nomineeName,
    nomineeAge,
    nomineeRelation,
    aadharcard_url,
    pancard_url,
    nominee_id_url,
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
    customer: customer._id,
    agent: agent._id,
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
    annualIncome: parseInt(annualIncome),
    occupation,
    coverage_amount: parseInt(coverage_amount) || 1000000,
    premium_amount: parseInt(premium_amount) || 50000,
    premium_frequency,
    policy_duration,
    status: "created",
    documents: {
      aadharcard_url,
      pancard_url,
      nominee_id_url,
    },
    nominee: {
      nominee_name: nomineeName,
      nominee_age: nomineeAge,
      nominee_relation: nomineeRelation,
    },
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
  // filter.status = { $ne: "claimed" };
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

  if (!id) return res.status(400).json({ success: false, message: "Policy ID is required" });

  if (!wallet_address || !role || !newStatus) {
    return res.status(400).json({ success: false, message: "Wallet address, role and new status are required" });
  }

  const policy = await Policy.findById(id).populate("customer");
  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }

  const currentStatus = policy.status;

  const transitions = {
    customer: {
      from: [null, "active"],
      to: ["created", "request-claim"]
    },
    agent: {
      from: ["created"],
      to: ["agentApproved", "cancelled"]
    },
    company: {
      from: ["agentApproved", "request-claim"],
      to: ["active", "claimed", "cancelled"]
    }
  };


  if (!transitions[role]) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const validFrom = transitions[role].from;
  const validTo = transitions[role].to;

  const isValidFrom = Array.isArray(validFrom)
    ? validFrom.includes(currentStatus)
    : validFrom === currentStatus;

  if (!isValidFrom) {
    return res.status(400).json({
      success: false,
      message: `Role '${role}' cannot update policy from '${currentStatus}'`
    });
  }

  if (!validTo.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${newStatus}' for role '${role}'`
    });
  }

  const COMPANY_ADDRESS = "0x87D757Fc89779c8aca68Dd9655dE948F4D17f0cf";

  if (role === "customer" && policy.customer_wallet_address !== wallet_address) {
    return res.status(403).json({ success: false, message: "Unauthorized customer" });
  }

  if (role === "agent" && policy.agent_wallet_address !== wallet_address) {
    return res.status(403).json({ success: false, message: "Unauthorized agent" });
  }

  if (role === "company" && COMPANY_ADDRESS !== wallet_address) {
    return res.status(403).json({ success: false, message: "Unauthorized company" });
  }

  let blockchainTxn = null;

  if (role === "company" && newStatus === "active") {
    const policyVC = await issuePolicyVC({
      policyId: policy._id,
      customerWallet: policy.customer_wallet_address,
      customerDid: policy?.customer?.customer_did,
      coverageAmount: policy.coverage_amount,
      premiumAmount: policy.premium_amount,
      durationYears: policy.policy_duration,
      status: newStatus,
      companyDid: COMPANY_DID
    });

    blockchainTxn = await createPolicyOnChain(
      policy.customer_wallet_address,
      policy.customer.customer_did,
      policyVC.hash
    );

    policy.policy_VC = policyVC;
    policy.txn_hash = blockchainTxn.txHash;
    policy.onchain_policyID = blockchainTxn.policyId;
  }

  policy.status = newStatus;
  await policy.save();

  return res.status(200).json({
    success: true,
    message: `Policy updated to '${newStatus}' by ${role}`,
    blockchainTxn,
    policy
  });
});


const claimPolicyRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Policy ID is required" });
  }

  const {
    customer_wallet_address,
    claimant_type,
    claimant_name,
    claimant_phone,
    claimant_email,
    claimant_relation,
    claimant_id_number,
    claim_reason,
    claim_description,
    incident_date,
    claim_amount,
    death_certificate_url,
    medical_reports_url,
    claimant_id_url,
    police_report_url,
    newStatus = "request-claim"
  } = req.body;

  const policy = await Policy.findById(id);
  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }

  if (policy.customer_wallet_address !== customer_wallet_address) {
    return res.status(403).json({ success: false, message: "Unauthorized customer" });
  }

  policy.claim_data = {
    claimant_type,
    claimant_name,
    claimant_phone,
    claimant_email,
    claimant_relation,
    claimant_id_number,
    claim_reason,
    claim_description,
    incident_date,
    claim_amount,
    claim_status: "pending", 
    claim_documents: {
      death_certificate_url,
      medical_reports_url,
      claimant_id_url,
      police_report_url
    },
    claim_request_date: new Date()
  };

  policy.status = newStatus; // should be request-claim

  await policy.save();

  return res.status(200).json({
    success: true,
    message: "Claim request submitted successfully",
    policy
  });
});
const claimPolicyCompanyCheck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {claim_status, wallet_address } = req.body;
  console.log(req.query, req.params, req.body);
  const COMPANY_ADDRESS = "0x87D757Fc89779c8aca68Dd9655dE948F4D17f0cf";

  if (!id || !claim_status) {
    return res.status(400).json({ success: false, message: "Policy ID and status are required" });
  }

  if (!["approved", "rejected"].includes(claim_status)) {
    return res.status(400).json({ success: false, message: "Invalid status. Use ?status=approved or ?status=rejected" });
  }

  if (wallet_address !== COMPANY_ADDRESS) {
    return res.status(403).json({ success: false, message: "Unauthorized company wallet" });
  }

  const policy = await Policy.findById(id);
  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }

  if (claim_status === "approved") {
    let blockchainTxn = null;

    try {
      blockchainTxn = await claimPolicyOnChain(policy.onchain_policyID);
    } catch (err) {
      console.error("Blockchain claim error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to process blockchain claim",
      });
    }

    policy.claim_data.claim_status = "approved";
    policy.claim_data.approval_date = new Date();
    policy.claim_data.claim_txnhash = blockchainTxn?.txHash || null;

    policy.status = "claimed";

    await policy.save();

    return res.status(200).json({
      success: true,
      message: "Claim approved successfully",
      claim_txnhash: blockchainTxn?.txHash,
      policy,
    });
  }

  if (claim_status === "rejected") {
    policy.claim_data.claim_status = "rejected";
    policy.status = "cancelled";

    await policy.save();

    return res.status(200).json({
      success: true,
      message: "Claim rejected successfully",
      policy,
    });
  }
});

export {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicyStatus,
  claimPolicyRequest,
  claimPolicyCompanyCheck
};