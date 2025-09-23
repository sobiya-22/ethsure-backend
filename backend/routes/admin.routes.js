import express from "express";
import { approveAgent , getPendingAgentKYCs , rejectAgent } from "../controllers/admin.controller.js";
const router = express.Router();

// ✅ Admin-only endpoints
router.get("/agents/pending", getPendingAgentKYCs);     // Get all pending agents
router.put("/agents/approve/:agentId", approveAgent);   // Approve an agent
router.put("/agents/reject/:agentId", rejectAgent);     // Reject an agent

export default router;
