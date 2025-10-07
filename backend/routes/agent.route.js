// routes/userRoutes.js
import express from "express";
import { getCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { getAgent, updateAgent } from "../controllers/agent.controller.js";

const router = express.Router();


router.post("/get", getAgent);               
router.put("/update", updateAgent);        

router.post("/get", getAgent);               
router.put("/update", updateAgent);        

export default router;
