import User from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import Agent from "../models/agent.model.js";
import Company from "../models/company.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { issueJWT } from "../utils/jwt.js";

// Register User
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { wallet_address, email } = req.body;

    let user = await User.findOne({ wallet_address });

    if (!user) {
      // New user, no role yet
      user = new User({ wallet_address, email, role: null });
      await user.save();
      return res.status(200).json({
        newUser: true,
        role: user.role,
        message: "Role selection required",
      });
    }

    // Existing user, issue JWT with role
    let userData = null;

    if (user.role === "customer") {
      userData = await Customer.findOne({ user: user._id }); 
    } else if (user.role === "agent") {
      userData = await Agent.findOne({ user: user._id });
    } else if (user.role === "company") {
      userData = await Company.findOne({ user: user._id });
    }
    console.log("userData",userData);
    const token = issueJWT(user);
    res.status(200).json({
      newUser: false,
      role:user.role,
      token,
      userData,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/user/assign-role
const assignRole = asyncHandler(async (req, res) => {
  const { wallet_address, did, role, name, profile_photo_url } = req.body;
  console.log("assignRole body:", req.body);

  if (!wallet_address || !role || !name) {
    return res.status(400).json({ error: "wallet address,name and role are required" });
  }

  const user = await User.findOne({ wallet_address });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // already has a role
  if (user.role) {
    return res.json({ message: `User already registred as a ${user.role}`, role: user.role });
  }

  let userData;
  switch (role) {
    case "customer":
      userData = await Customer.create({
        user: user._id,
        customer_did: did,
        wallet_address: user.wallet_address,
        customer_email: user.email,
        customer_name: name,
        profile_photo_url: profile_photo_url,
      });
      break;

    case "agent":
      userData = await Agent.create({
        user: user._id,
        agent_did: did,
        wallet_address: user.wallet_address,
        agent_email: user.email,
        agent_name: name,
        profile_photo_url: profile_photo_url,
      });
      break;

    case "company":
      userData = await Company.create({
        user: user._id,
        company_name: name,
        company_did: did,
        wallet_address: user.wallet_address,
      });
      break;

    // case "nominee":
    //   roleDoc = await Nominee.create({
    //     user: user._id,
    //     nominee_did: `did:nominee:${Date.now()}`,
    //     wallet_address: user.wallet_address,
    //     verified: false,
    //   });
    //   break;

    default:
      return res.status(400).json({ error: "Invalid role" });
  }
  user.role = role;
  await user.save();

  // now issue token
  const token = issueJWT(user.email, user.role);

  return res.status(200).json({
    message: "Role assigned",
    token,
    userData,
  });
});

export { registerUser, assignRole };