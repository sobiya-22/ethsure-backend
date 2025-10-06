// routes/userRoutes.js
import express from "express";
import { getCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { getAgent, updateAgent , getAllAgents ,getPendingAgents , getApprovedAgents, sendAssociationRequest, rejectPolicyRequest, approvePolicyRequest, getAgentPolicyRequests } from "../controllers/agent.controller.js";

const router = express.Router();


router.post("/get", getAgent);               
router.put("/update", updateAgent); 
router.post("/pending", getPendingAgents);
router.post("/approved", getApprovedAgents);
router.post("/all", getAllAgents);       

// Agent policy requests
router.post("/policy-requests", getAgentPolicyRequests);
router.post("/policy-approve", approvePolicyRequest);
router.post("/policy-reject", rejectPolicyRequest);

// Association request (agent to company)
router.post("/send-association-request", sendAssociationRequest);

export default router;
