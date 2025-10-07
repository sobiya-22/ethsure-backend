import express from "express";
import {
    //createPolicy,
    getPolicy,
    updatePolicy,
    deactivatePolicy,
    requestPolicy
} from "../controllers/policy.controller.js";

const router = express.Router();

//router.post("/create", createPolicy);
router.get("/get", getPolicy);
router.put("/update", updatePolicy);
router.put("/deactivate", deactivatePolicy);
router.post("/request", requestPolicy);

export default router;