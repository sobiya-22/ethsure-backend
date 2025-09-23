import express from "express";
import { registerUser, assignRole } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", registerUser);
router.patch("/assign-role", assignRole);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
export default router;