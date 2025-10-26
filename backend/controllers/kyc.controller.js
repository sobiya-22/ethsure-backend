import User from "../models/user.model.js"
import Agent from "../models/agent.model.js";
import Customer from "../models/customer.model.js";
import twilio from 'twilio';
import { asyncHandler } from "../utils/asyncHandler.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
console.log("Twilio SID:", accountSid);
console.log("Twilio Token:", authToken ? "Loaded ✅" : "Missing ❌");
console.log("Twilio Phone:", twilioPhone);
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

  const { wallet_address, role, phone_number } = req.body;
  console.log(req.body);
  if (!wallet_address || !role || !phone_number) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }


  // Check user existence
  // const Model = role === "customer" ? Customer : Agent;

  const user = await User.findOne({ wallet_address: wallet_address.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `${role} not found`
    });
  }

  if (user[role] && user[role].kyc_status === "verified") {
    return res.status(400).json({
      success: false,
      message: "KYC already verified",
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
    otpStore.set(wallet_address, { otp, expires, role });

    console.log(`OTP sent to ${formattedPhone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${formattedPhone}`,
      messageId: message.sid
    });
  } catch (err) {
    console.error("Twilio Error:", err.message);
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
  console.log(req.body);
  if (!wallet_address || !otp) {
    return res.status(400).json({
      success: false,
      message: "Wallet address and OTP required"
    });
  }

  const data = otpStore.get(wallet_address);

  if (!data) return res.status(400).json({
    success: false,
    message: "No OTP found"
  });

  if (Date.now() > data.expires) {
    otpStore.delete(wallet_address);
    return res.status(400).json({
      success: false,
      message: "OTP expired"
    });
  }

  if (otp !== data.otp) return res.status(400).json({
    success: false,
    message: "Invalid OTP"
  });

  // Update KYC status
  const Model = data.role === "customer" ? Customer : Agent;

  await Model.findOneAndUpdate(
    { wallet_address},
    { kyc_status: "verified" },
    { new: true }
  );

  otpStore.delete(wallet_address); 

  console.log(`Mobile no. verified for ${data.role}: ${wallet_address}`);

  res.status(200).json({
    success: true,
    message: "KYC done successfully"
  });
});

// RESEND OTP
const resendKYCOTP = asyncHandler(async (req, res) => {
  const { wallet_address,role,phone_number } = req.body;

  if (!wallet_address || !role, !phone_number)
    return res.status(400).json({ success: false, message: "All fields required" });

  const existing = otpStore.get(wallet_address.toLowerCase());
  if (!existing) {
    return sendKYCOTP(req, res);
  }
  
});

export const submitKYC = async (req, res) => {
  try {
    const { wallet_address, role, name, phone, dob, occupation, income } = req.body;
    if (!wallet_address || !role) {
      return res.status(400).json({ success: false, message: "Wallet address and role required" });
    }

    const user = await User.findOne({ wallet_address: wallet_address });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    console.log("user: ",user)
    if (role === "customer") {
      let customer = await Customer.findOne({ user: user._id });

      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      customer.customer_name = name;
      customer.customer_phone = phone;
      customer.date_of_birth = dob;
      customer.occupation = occupation;
      customer.income = income;
      customer.kyc_status = "verified";

      await customer.save();

      return res.status(200).json({ success: true, message: "Customer KYC verified", customer });
    }

    if (role === "agent") {
      let agent = await Agent.findOne({ user: user._id });

      if (!agent) {
        return res.status(404).json({ success: false, message: "Agent not found" });
      }
      console.log("agent: ", agent);
      agent.agent_name = name;
      agent.agent_phone = phone;
      agent.date_of_birth = dob;
      agent.occupation = occupation;
      agent.income = income;
      agent.kyc_status = "verified";

      await agent.save();

      return res.status(200).json({ success: true, message: "Agent KYC verified", agent });
    }

    return res.status(400).json({ success: false, message: "Invalid role" });
  } catch (error) {
    console.error("KYC Submission Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// //check user kyc status
// const checkKYCStatus = asyncHandler(async (req, res) => {
//   const { wallet_address, user_role } = req.body;

//   if (!wallet_address || !user_role) {
//     return res.status(400).json({
//       success: false,
//       message: "Wallet address and user role are required",
//     });
//   }

//   if (!["customer", "agent"].includes(user_role)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user role",
//     });
//   }

//   const Model = user_role === "customer" ? Customer : Agent;

//   const user = await Model.findOne({ wallet_address: wallet_address.toLowerCase() });

//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: `${user_role} not found`,
//     });
//   }

//   res.status(200).json({
//     success: true,
//     kyc_status: user.kyc_status || "pending",
//     message: `KYC status for ${user_role} is ${user.kyc_status || "pending"}`,
//   });
// });

export { generateOTP, otpStore, OTP_EXPIRY, twilioClient, sendKYCOTP, verifyKYCOTP, resendKYCOTP }
