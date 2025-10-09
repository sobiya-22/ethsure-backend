<<<<<<< Updated upstream
=======
// routes/userRoutes.js
import express from "express";
import {
    getAgent, getAllAgentPolicies
    // , getPolicyRequests, updateAgent, updatePolicyStatus
} from "../controllers/agent.controller.js";

const router = express.Router();


router.post("/get", getAgent);               
router.patch("/update", updateAgent);  
// router.post("/policy-requests", getPolicyRequests);
// router.put("/update-policy-status", updatePolicyStatus);
// router.post("/all-policies", getAllAgentPolicies);      

export default router;
>>>>>>> Stashed changes
