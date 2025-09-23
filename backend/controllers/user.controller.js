import User from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import Agent from "../models/agent.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
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
    const token = issueJWT(user);

    res.json({
      newUser: false,
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/user/assign-role
const assignRole = asyncHandler(async (req, res) => {
  const { wallet_address, role } = req.body;

  if (!wallet_address || !role) {
    return res.status(400).json({ error: "wallet address and role are required" });
  }

  const user = await User.findOne({ wallet_address });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // already has a role
  if (user.role) {
    return res.status(400).json({ error: `User already registred as a ${user.role} ` });
  }
  
  let roleDoc;
  switch (role) {
    case "customer":
      roleDoc = await Customer.create({
        user: user._id,
        // customer_did: `did:customer:${Date.now()}`,
        wallet_address: user.wallet_address,
        email : user.email,
      });
      break;

    case "agent":
      roleDoc = await Agent.create({
        user: user._id,
        // agent_did: `did:agent:${Date.now()}`,
        wallet_address: user.wallet_address,
        email : user.email,
      });
      break;

    // case "company":
    //   roleDoc = await Company.create({
    //     user: user._id,
    //     company_did: `did:company:${Date.now()}`,
    //     wallet_address: user.wallet_address,
    //     registered_on: new Date(),
    //   });
    //   break;

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
  const token = issueJWT(user.email,user.role );

  return res.status(200).json({
    message: "Role assigned",
    user,
    roleDoc,
    token,
  });
});

export { registerUser, assignRole };
