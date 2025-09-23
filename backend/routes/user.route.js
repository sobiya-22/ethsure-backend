import express from "express";
import { registerUser,assignRole } from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/users/register
router.post("/login", registerUser);

router.patch("/assign-role", assignRole);

export default router;
