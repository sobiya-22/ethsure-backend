import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Agent from "../models/agent.model.js";
import Customer from "../models/customer.model.js";

// 1) Register / Get user 
const registerOrGetUser = asyncHandler(async (req, res) => {
  const { wallet_address, user_did,  email } = req.body;
  if (!wallet_address) return res.status(400).json({ success: false, message: "wallet_address is required" });

  let user = await User.findOne({ wallet_address });
  if (user) {
    return res.status(200).json({
      success: true,
      message: "User exists",
      user,
      isNew: false,
      needsRole: !user.role,
      needsKYC: !user.kyc_completed,
    });
  }

  user = await User.create({
    user_did: user_did || `did:user:${Date.now()}`,
    wallet_address,
    name: name || "",
    email: email || "",
  });

  return res.status(201).json({
    success: true,
    message: "User created",
    user,
    isNew: true,
    needsRole: true,
    needsKYC: true,
  });
});

// 2) Select role (customer | agent)
const selectRole = asyncHandler(async (req, res) => {
  const { wallet_address, role } = req.body;
  if (!wallet_address || !role) return res.status(400).json({ success: false, message: "wallet_address and role required" });

  const user = await User.findOne({ wallet_address });

  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  //if (!["customer", "agent"].includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });

  // If role doc doesn't exist
  let roleDoc = null;
  if (role === "agent") {
    roleDoc = await Agent.findOne({ user: user._id });
    if (!roleDoc) {
      roleDoc = await Agent.create({
        user: user._id,
        agent_did: `did:agent:${Date.now()}`,
        wallet_address: user.wallet_address,
        kyc_status: "pending",
        is_approved: false,
      });
    }
    user.role_model = "Agent";
  } else {
    roleDoc = await Customer.findOne({ user: user._id });
    if (!roleDoc) {
      roleDoc = await Customer.create({
        user: user._id,
        customer_did: `did:customer:${Date.now()}`,
        wallet_address: user.wallet_address,
        kyc_status: "pending",
      });
    }
    user.role_model = "Customer";
  }

  user.role = role;
  user.role_ref = roleDoc._id;
  await user.save();

  return res.status(200).json({ success: true, message: "Role selected", user, roleDoc });
});

// 3) Get user by wallet (useful for frontend redirect)
const getUserByWallet = asyncHandler(async (req, res) => {
  const { wallet_address } = req.params;
  if (!wallet_address) 
    return res.status(400).json({ success: false, message: "wallet_address required" });

  const user = await User.findOne({ wallet_address }).populate("role_ref");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  return res.status(200).json({ success: true, user });
});

export {registerOrGetUser , selectRole , getUserByWallet }

/*
import User from "../models/user.model";
import asyncHandler from "../utils/asyncHandler.js";
// Register User
export const registerUser = asyncHandler (async(req, res) => {
  try {
    const { walletAddress, did, email, role } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (existingUser) {
      return res.status(200).json({
        message: `Already registered as ${existingUser.role}`,
        user: existingUser
      });
    }

    // Create new user
    const newUser = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      did,
      email,
      role: role 
    });

    return res.status(201).json({
      message: `Successfully registered as ${newUser.role}`,
      user: newUser
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
});*/
