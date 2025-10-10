import express from "express";
import { createPolicy, getPolicies, getPolicyById, updatePolicyStatus } from "../controllers/policy.controller.js";

const router = express.Router();

// Create policy
router.post("/create", createPolicy);

// Get policies with filters (customer_wallet, agent_wallet, status)
router.get("/all-policies", getPolicies);

// Get single policy by ID
router.get("/:id", getPolicyById);

// Update policy status
router.put("/update-status/:id", updatePolicyStatus);

export default router;
