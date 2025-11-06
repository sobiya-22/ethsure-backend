// routes/userRoutes.js
import express from "express";
import { getAllAgents,updateAgentAssociationStatus, sendAssociationRequest } from "../controllers/agent.controller.js";

const router = express.Router();


// router.post("/get", getAgent);
router.get("/all-agents", getAllAgents);
// router.post("/policy-requests", getPolicyRequests);
// router.post("/all-policies", getAllAgentPolicies);
router.patch("/update-status", updateAgentAssociationStatus);
router.post("/send-association", sendAssociationRequest);
export default router;
