
import Agent from "../models/agent.model.js";
import Customer from "../models/customer.model.js";
import twilio from 'twilio';
import { asyncHandler } from "../utils/asyncHandler.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const twilioClient = twilio(accountSid, authToken);

// Constants
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Temporary OTP storage
const otpStore = new Map();

//SEND OTP
const sendKYCOTP = asyncHandler(async (req, res) => {

  const { wallet_address, user_type, phone_number } = req.body;

  if (!wallet_address || !user_type || !phone_number) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields required" 
    });
  }

  if (!["customer", "agent"].includes(user_type)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid user type" 
    });
  }

  // Check user existence
  const Model = user_type === "customer" ? Customer : Agent;

  const user = await Model.findOne({ wallet_address: wallet_address.toLowerCase() });

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: `${user_type} not found` 
    });
  }

  if (user.kyc_status === "verified") {
    return res.status(400).json({ 
      success: false, 
      message: "KYC already verified" 
    });
  }

  // Generate OTP
  const otp = generateOTP();
  const expires = Date.now() + OTP_EXPIRY;

  // Send OTP using Twilio
  const formattedPhone = phone_number.startsWith("+") ? phone_number : `+91${phone_number}`;

  try {
    const message = await twilioClient.messages.create({
      body: `Your KYC OTP is ${otp}. It will expire in 10 minutes.`,
      from: twilioPhone,
      to: formattedPhone
    });

    // Save OTP in temporary store (overwrite any previous)
    otpStore.set(wallet_address.toLowerCase(), { otp, expires, user_type });

    console.log(`OTP sent to ${formattedPhone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${formattedPhone}`,
      messageId: message.sid
    });
  } catch (err) {
    console.error("❌ Twilio Error:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP", 
      error: err.message 
    });
  }
});

//VERIFY OTP
const verifyKYCOTP = asyncHandler(async (req, res) => {
  const { wallet_address, otp } = req.body;

  if (!wallet_address || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: "Wallet address and OTP required" 
    });
  }

  const user = wallet_address.toLowerCase();
  const data = otpStore.get(user);

  if (!data) return res.status(400).json({ 
    success: false, 
    message: "No OTP found" 
  });

  if (Date.now() > data.expires) {
    otpStore.delete(user);// Clear used OTP
    return res.status(400).json({ 
      success: false, 
      message: "OTP expired" 
    });
  }

  if (otp !== data.otp) return res.status(400).json({ 
    success: false, 
    message: "Invalid OTP" });

  // Update KYC status
  const Model = data.user_type === "customer" ? Customer : Agent;

  await Model.findOneAndUpdate(
    { wallet_address: user },
    { kyc_status: "verified" },
    { new: true }
  );

  otpStore.delete(user); // Clear used OTP

  console.log(`✅ KYC verified for ${data.user_type}: ${wallet_address}`);

  res.status(200).json({ 
    success: true, 
    message: "KYC verified successfully" 
  });
});

// RESEND OTP
const resendKYCOTP = asyncHandler(async (req, res) => {
  const { wallet_address } = req.body;

  if (!wallet_address)
    return res.status(400).json({ success: false, message: "Wallet address required" });

  const existing = otpStore.get(wallet_address.toLowerCase());
  if (!existing)
    return res.status(400).json({ 
  success: false, 
  message: "No previous OTP found" });

  // Reuse the same user_type and phone_number
  req.body.user_type = existing.user_type;
  req.body.phone_number = existing.phone_number;

  return sendKYCOTP(req, res);
});

// CHECK KYC STATUS
const checkKYCStatus = asyncHandler(async (req, res) => {
  const { wallet_address, user_type } = req.body;

  // Validate input
  if (!wallet_address || !user_type) {
    return res.status(400).json({
      success: false,
      message: "Wallet address and user type are required"
    });
  }

  if (!["customer", "agent"].includes(user_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user type"
    });
  }

  // Select the correct model
  const Model = user_type === "customer" ? Customer : Agent;

  // Find user
  const user = await Model.findOne({ wallet_address: wallet_address.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `${user_type} not found`
    });
  }

  // Return KYC status
  return res.status(200).json({
    success: true,
    data: {
      wallet_address: user.wallet_address,
      user_type,
      kyc_status: user.kyc_status || "pending"
    }
  });
});

export {generateOTP , otpStore , OTP_EXPIRY , twilioClient , sendKYCOTP , verifyKYCOTP , resendKYCOTP , checkKYCStatus }