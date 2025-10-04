import express from "express";
import { getCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { getAgent, updateAgent } from "../controllers/agent.controller.js";

const router = express.Router();

router.post("/get", getCustomer);         // Get customer by wallet_address
router.put("/update", updateCustomer);   // Update customer by wallet_address// routes/userRoutes.js

export default router;
