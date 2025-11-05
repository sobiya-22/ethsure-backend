import express from "express";
import {
    register, login,getUser,updateUser
} from "../controllers/user.controller.js";
import { authenticate} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/register',register)
router.post('/login', login)
router.get('/:wallet_address', getUser);
router.patch("/update-user/:wallet_address", updateUser);

// router.post("/login", registerUser);
// router.patch("/assign-role", assignRole);
// router.get("/me", authMiddleware, (req, res) => {
//   res.json({ user: req.user });
// });
export default router;