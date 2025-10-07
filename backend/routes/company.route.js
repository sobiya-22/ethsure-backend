// import { get } from "http";
// import { registerCompany,getCompanies } from "../controllers/company.controller.js";
// import express from "express";

// const router = express.Router();

// router.get("/", getCompanies);

// export default router;

import express from "express" ;
import { approveAgent, getAllAgents, getApprovedAgents, getPendingAgents, rejectAgent } from "../controllers/company.controller.js";


const router = express.Router();


router.post("/agents/pending", getPendingAgents);
router.post("/agents/approved", getApprovedAgents);
router.post("/agents/all", getAllAgents);
router.post("/agents/approve", approveAgent);
router.post("/agents/reject", rejectAgent);

export default router ;
