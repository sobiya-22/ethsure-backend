import express from "express";
import {
<<<<<<< Updated upstream
    createPolicy,
    getPolicy,
    updatePolicy,
    deactivatePolicy
=======
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicyStatus,
>>>>>>> Stashed changes
} from "../controllers/policy.controller.js";

const router = express.Router();

router.post("/create", createPolicy);
<<<<<<< Updated upstream
router.get("/get", getPolicy);
router.put("/update", updatePolicy);
router.put("/deactivate", deactivatePolicy);
=======
router.get("/all-policies", getPolicies);
router.get("/:id", getPolicyById);
router.patch("/:id/status", updatePolicyStatus);
>>>>>>> Stashed changes

export default router;
