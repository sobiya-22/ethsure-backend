// routes/userRoutes.js
import express from "express";
import { getAgent, getAllAgentPolicies, getPolicyRequests, updateAgent } from "../controllers/agent.controller.js";

const router = express.Router();


router.post("/get", getAgent);               
router.patch("/update", updateAgent);  
router.post("/policy-requests", getPolicyRequests);
router.post("/all-policies", getAllAgentPolicies);      

// router.put("/update-policy-status", updatePolicyStatus);
export default router;
