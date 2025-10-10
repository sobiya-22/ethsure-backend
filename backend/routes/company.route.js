// import { get } from "http";
// import { registerCompany,getCompanies } from "../controllers/company.controller.js";
// import express from "express";

// const router = express.Router();

// router.get("/", getCompanies);

// export default router;

import express from "express" ;
import { getAgents , updateAgentApproval } from "../controllers/company.controller.js";


const router = express.Router();

router.post("/agents", getAgents);
router.patch("/agent-approval", updateAgentApproval);

export default router ;
