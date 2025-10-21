// routes/userRoutes.js
import express from "express";
import { getAgent, getAllAgents, getAllAgentPolicies, getPolicyRequests, sendAssociationRequest, updateAgent } from "../controllers/agent.controller.js";

const router = express.Router();


router.post("/get", getAgent);
router.get("/all-agents", getAllAgents);
router.patch("/update", updateAgent);
router.post("/policy-requests", getPolicyRequests);
router.post("/all-policies", getAllAgentPolicies);
router.post("/send-association", sendAssociationRequest);
export default router;
