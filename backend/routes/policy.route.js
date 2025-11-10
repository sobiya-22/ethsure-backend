import express from "express";
import { claimPolicyCompanyCheck,claimPolicyRequest, createPolicy, getPolicies, getPolicyById, updatePolicyStatus } from "../controllers/policy.controller.js";

const router = express.Router();

// Create policy
router.post("/create", createPolicy);

// Get policies with filters (customer_wallet, agent_wallet, status)
router.get("/all-policies", getPolicies);

// Get single policy by ID
router.get("/:id", getPolicyById);

// Update policy status
router.post("/update-status/:id", updatePolicyStatus);

//claim policy 
router.post('/claim-policy/:id',claimPolicyRequest);


router.post('/update-claim-status/:id',claimPolicyCompanyCheck)
export default router;
