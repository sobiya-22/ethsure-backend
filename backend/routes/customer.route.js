import express from "express";
import { getCustomer, sendPolicyRequest, updateCustomer } from "../controllers/customer.controller.js";
import { getAgent, updateAgent } from "../controllers/agent.controller.js";

const router = express.Router();

router.post("/get", getCustomer);         // Get customer by wallet_address
router.put("/update", updateCustomer);   // Update customer by wallet_address// routes/userRoutes.js

// Customer sends policy request to agent
router.post("/send-policy-request", sendPolicyRequest);

export default router;