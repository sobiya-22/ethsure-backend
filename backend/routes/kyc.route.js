import express from "express" ;
import { checkKYCStatus, resendKYCOTP, sendKYCOTP, verifyKYCOTP } from "../controllers/kyc.controller.js";

const router = express.Router();

router.post("/send-otp" , sendKYCOTP);
router.post("/verify-otp" , verifyKYCOTP);
router.post("/resend-otp" , resendKYCOTP );

router.post("/check-kyc-status" , checkKYCStatus);

export default router ;