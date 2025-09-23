import express from "express";
import { registerOrGetUser, selectRole, getUserByWallet } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", registerOrGetUser);
router.post("/select-role", selectRole);
router.get("/:wallet_address", getUserByWallet);

export default router;
