import { Router } from "express";
import { completeAgentKYC, getAgent,getAllAgents, registerOrGetAgent} from "../controllers/agent.controller.js";

const router = Router();

router.post("/register", registerOrGetAgent);
router.post("/complete-kyc", completeAgentKYC);
router.get("/:wallet_address", getAgent);
router.get("/", getAllAgents);

export default router;