// import { get } from "http";
// import { registerCompany,getCompanies } from "../controllers/company.controller.js";
// import express from "express";

// const router = express.Router();

// router.get("/", getCompanies);

// export default router;

import express from "express" ;
import { approveAgent, getPendingAgentRequests, rejectAgent } from "../controllers/company.controller.js";


const router = express.Router();

router.post("/approve-association", approveAgent);
router.post("/reject-association", rejectAgent);
router.get("/pending-association-requests", getPendingAgentRequests);

export default router ;