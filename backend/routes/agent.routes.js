import express from "express";
import { submitAgentKYC, getAgent , getAllAgents , checkKYCStatus } from "../controllers/agent.controller.js";
const router = express.Router();

//router.post("/register", registerOrGetAgent);
router.post("/kyc", submitAgentKYC);
router.get("/kyc-status/:wallet_address", checkKYCStatus);
router.get("/:wallet_address", getAgent);
router.get("/", getAllAgents);


export default router;
