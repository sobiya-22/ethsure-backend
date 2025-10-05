// routes/userRoutes.js
import express from "express";
import { getCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { getAgent, getAllAgents, getApprovedAgents, getPendingAgents, sendAssociationRequest, updateAgent } from "../controllers/agent.controller.js";

const router = express.Router();

router.post("/pending", getPendingAgents);
router.post("/approved", getApprovedAgents);
router.post("/all", getAllAgents);
router.post("/get", getAgent);               
router.put("/update", updateAgent);  
router.post("/sendReq" , sendAssociationRequest);      

export default router;
