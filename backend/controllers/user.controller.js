import User from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import Agent from "../models/agent.model.js";
import Company from "../models/company.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { issueJWT } from "../utils/jwt.js";
import jwt from 'jsonwebtoken';


const register = asyncHandler(async (req, res) => {
  const { wallet_address, email, role, name, phone, did, profile_url } = req.body;
  console.log(req.body);
  if (!wallet_address || !email || !role) {
    return res.status(400).send({
      message: "All fields are required",
      success: false
    });
  }

  let user = await User.findOne({ wallet_address });
  if (user) {
    return res.status(400).send({
      message: "User already exists",
      success: false
    });
  }
  user = new User({
    wallet_address,
    email,
    role,
  });
  await user.save();
  let userData = null;
  switch (role) {
    case "customer":
      userData = await Customer.create({
        user: user._id,
        customer_email: email,
        wallet_address,
        customer_did: did,
        customer_name: name,
        customer_phone: phone,
        profile_photo_url: profile_url,
      });
      user.customer = userData._id;
      await user.save();
      break;
    case "agent":
      userData = await Agent.create({
        user: user._id,
        wallet_address,
        agent_email: email,
        agent_did: did,
        agent_name: name,
        agent_phone: phone,
        profile_photo_url: profile_url,
      });
      user.agent = userData._id;
      await user.save();
      break;
    default:
      return res.status(400).json({ message: "Invalid role", success: false });
  }
  console.log("Saved user:", await User.findById(user._id));
  return res.status(200).json({
    success: true,
    message: "User registered successfully! ",
    user
  });
});

const login = asyncHandler(async (req, res) => {
  const { wallet_address } = req.body;

  if (!wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Wallet address is required",
    });
  }

  const user = await User.findOne({ wallet_address: wallet_address })
    .populate("customer")
    .populate("agent")
    .populate("company")
    .populate("nominee");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Account does not exist. Please sign up first.",
    });
  }
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  console.log("user: ", user);
  return res.status(200).cookie("token", token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000
  }).json({
    success: true,
    message: "Login successful",
    token,
    user,
  });
});

const getUser = asyncHandler(async (req, res) => {
  console.log(req.params.wallet_address);
  const user = await User.findOne({
    wallet_address: req.params.wallet_address.toLowerCase()
  })
    .populate("customer")
    .populate("agent");

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});
// Register User
// const registerUser = asyncHandler(async (req, res) => {
//   try {
//     const { wallet_address, email } = req.body;

//     let user = await User.findOne({ wallet_address });

//     if (!user) {
//       // New user, no role yet
//       user = new User({ wallet_address, email, role: null });
//       await user.save();
//       return res.status(200).json({
//         newUser: true,
//         role: user.role,
//         message: "Role selection required",
//       });
//     }

//     // Existing user, issue JWT with role
//     let userData = null;

//     if (user.role === "customer") {
//       userData = await Customer.findOne({ user: user._id });
//     } else if (user.role === "agent") {
//       userData = await Agent.findOne({ user: user._id });
//     } else if (user.role === "company") {
//       userData = await Company.findOne({ user: user._id });
//     }
//     console.log("userData", userData);
//     const token = issueJWT(user);
//     res.status(200).json({
//       newUser: false,
//       role: user.role,
//       token,
//       userData,
//     });
//   } catch (error) {
//     console.error("Error in registerUser:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

// // PATCH /api/user/assign-role
// const assignRole = asyncHandler(async (req, res) => {
//   const { wallet_address, did, role, name, profile_photo_url } = req.body;
//   console.log("assignRole body:", req.body);

//   if (!wallet_address || !role || !name) {
//     return res.status(400).json({ error: "wallet address,name and role are required" });
//   }

//   const user = await User.findOne({ wallet_address });
//   if (!user) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   // already has a role
//   if (user.role) {
//     return res.json({ message: `User already registred as a ${user.role}`, role: user.role });
//   }

//   let userData;
//   switch (role) {
//     case "customer":
//       userData = await Customer.create({
//         user: user._id,
//         customer_did: did,
//         wallet_address: user.wallet_address,
//         customer_email: user.email,
//         customer_name: name,
//         profile_photo_url: profile_photo_url,
//       });
//       break;

//     case "agent":
//       userData = await Agent.create({
//         user: user._id,
//         agent_did: did,
//         wallet_address: user.wallet_address,
//         agent_email: user.email,
//         agent_name: name,
//         profile_photo_url: profile_photo_url,
//       });
//       break;

//     case "company":
//       userData = await Company.create({
//         user: user._id,
//         company_name: name,
//         company_did: did,
//         wallet_address: user.wallet_address,
//       });
//       break;

//     // case "nominee":
//     //   roleDoc = await Nominee.create({
//     //     user: user._id,
//     //     nominee_did: `did:nominee:${Date.now()}`,
//     //     wallet_address: user.wallet_address,
//     //     verified: false,
//     //   });
//     //   break;

//     default:
//       return res.status(400).json({ error: "Invalid role" });
//   }
//   user.role = role;
//   await user.save();

//   // now issue token
//   const token = issueJWT(user.email, user.role);

//   return res.status(200).json({
//     message: "Role assigned",
//     token,
//     userData,
//   });
// });

export {
  register, login, getUser
  // registerUser, assignRole
};