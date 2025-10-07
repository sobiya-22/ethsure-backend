import express from "express";
import {
    createPolicy,
    getPolicy,
    updatePolicy,
    deactivatePolicy
} from "../controllers/policy.controller.js";

const router = express.Router();

router.post("/create", createPolicy);
router.get("/get", getPolicy);
router.put("/update", updatePolicy);
router.put("/deactivate", deactivatePolicy);

export default router;