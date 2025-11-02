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
    case "company":
      userData = await Company.create({
        user: user._id,
        wallet_address,
        company_email: email,
        company_did: did,
        company_name: name,
        profile_photo_url: profile_url,
      });
      user.company = userData._id;
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
    wallet_address: req.params.wallet_address
  })
    .populate("customer")
    .populate("agent");

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});


export {
  register, login, getUser
};