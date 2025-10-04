import express from "express" ;
import { resendKYCOTP, sendKYCOTP, verifyKYCOTP } from "../controllers/kyc.controller.js";

const router = express.Router();

router.post("/send-otp" , sendKYCOTP);
router.post("/verify-otp" , verifyKYCOTP);
router.post("/resend-otp" , resendKYCOTP );

export default router ;