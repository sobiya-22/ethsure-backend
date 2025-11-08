import User from "../models/user.model.js";
import Agent from "../models/agent.model.js";
import Customer from "../models/customer.model.js";
import twilio from "twilio";
import { asyncHandler } from "../utils/asyncHandler.js";

const TWILIO_ACCOUNT_SID='AC9c48773245f3d87e95307a31bf3f332b'
const TWILIO_AUTH_TOKEN='b09f14e5d2857adcabf565b3fcf34ee0'
const TWILIO_VERIFY_SERVICE_ID='VA033c645972f8ff08d8e92718e4189403'

const client = twilio(
  TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

//
// SEND OTP USING TWILIO VERIFY API
//
export const sendKYCOTP = asyncHandler(async (req, res) => {
  const { wallet_address, role, phone_number } = req.body;

  if (!wallet_address || !role || !phone_number) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }

  const user = await User.findOne({ wallet_address });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `${role} not found`,
    });
  }

  if (user[role] && user[role].kyc_status === "verified") {
    return res.status(400).json({
      success: false,
      message: "KYC already verified",
    });
  }

  // Format phone
  const formattedPhone = phone_number.startsWith("+")
    ? phone_number
    : `+91${phone_number}`;

  try {
    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${formattedPhone}`,
      sid: result.sid,
    });
  } catch (err) {
    console.error("Twilio Verify Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
});

//
// VERIFY OTP USING TWILIO VERIFY API
//
export const verifyKYCOTP = asyncHandler(async (req, res) => {
  const { wallet_address, otp, phone_number } = req.body;
  console.log(req.body)
  if (!wallet_address || !otp || !phone_number) {
    return res.status(400).json({
      success: false,
      message: "Wallet, phone & OTP required",
    });
  }

  const formattedPhone = phone_number.startsWith("+")
    ? phone_number
    : `+91${phone_number}`;

  try {
    const result = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks.create({
        to: formattedPhone,
        code: otp,
      });

    if (result.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // OTP SUCCESSFUL → Now update KYC status based on role
    const user = await User.findOne({ wallet_address });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const role = user.role;

    if (role === "customer") {
      await Customer.findOneAndUpdate(
        { user: user._id },
        { kyc_status: "verified" }
      );
    }

    if (role === "agent") {
      await Agent.findOneAndUpdate(
        { user: user._id },
        { kyc_status: "verified" }
      );
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("OTP VERIFY ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//
// RESEND OTP USING VERIFY SERVICE
//
export const resendKYCOTP = asyncHandler(async (req, res) => {
  return sendKYCOTP(req, res);
});

//
// existing submitKYC remains same
//
export const submitKYC = async (req, res) => {
  try {
    const { wallet_address, role, name, phone, dob, occupation, income } =
      req.body;

    if (!wallet_address || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Wallet address and role required" });
    }

    const user = await User.findOne({ wallet_address });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (role === "customer") {
      let customer = await Customer.findOne({ user: user._id });

      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      customer.customer_name = name;
      customer.customer_phone = phone;
      customer.date_of_birth = dob;
      customer.occupation = occupation;
      customer.income = income;
      customer.kyc_status = "verified";

      await customer.save();

      return res
        .status(200)
        .json({ success: true, message: "Customer KYC verified", customer });
    }

    if (role === "agent") {
      let agent = await Agent.findOne({ user: user._id });

      if (!agent) {
        return res
          .status(404)
          .json({ success: false, message: "Agent not found" });
      }

      agent.agent_name = name;
      agent.agent_phone = phone;
      agent.date_of_birth = dob;
      agent.occupation = occupation;
      agent.income = income;
      agent.kyc_status = "verified";

      await agent.save();

      return res
        .status(200)
        .json({ success: true, message: "Agent KYC verified", agent });
    }

    return res.status(400).json({ success: false, message: "Invalid role" });
  } catch (error) {
    console.error("KYC Submission Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
