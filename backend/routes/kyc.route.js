import express from "express" ;
import { resendKYCOTP, sendKYCOTP, submitKYC, verifyKYCOTP } from "../controllers/kyc.controller.js";

const router = express.Router();

router.post("/send-otp" , sendKYCOTP);
router.post("/verify-otp" , verifyKYCOTP);
router.post("/resend-otp", resendKYCOTP);
router.post("/submit", submitKYC);
// router.post("/status" , checkKYCStatus);

export default router ;