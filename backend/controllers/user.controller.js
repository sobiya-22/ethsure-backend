import User from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import Agent from "../models/agent.model.js";
import Company from "../models/company.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { issueJWT } from "../utils/jwt.js";
import jwt from 'jsonwebtoken';
import { getAgentCompany,isAgentRegistered,getAgentVcHash } from "../blockchain/agentRegistry.js";

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
    .populate("company");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Account does not exist. Please sign up first.",
    });
  }

 let blockchainInfo = {
  isOnChainRegistered: false,
  onChainCompanyDid: null,
  agentRegistrationTxHash: null
};

if (user.role === "agent") {
  const agentDid = user.agent?.agent_did;

  if (agentDid) {
    blockchainInfo.isOnChainRegistered = await isAgentRegistered(agentDid);

    if (blockchainInfo.isOnChainRegistered) {
      blockchainInfo.onChainCompanyDid = await getAgentCompany(agentDid);
      blockchainInfo.agentRegistrationTxHash = await getAgentVcHash(agentDid);
    }
  }
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
    blockchainInfo,
  });
});

const getUser = asyncHandler(async (req, res) => {
  console.log(req.params.wallet_address);
  const user = await User.findOne({
    wallet_address: req.params.wallet_address
  })
    .populate("customer")
    .populate("agent")
    .populate('company');

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  let blockchainInfo = {};

  if (user.role === "agent") {
    const agentDid = user.agent?.agent_did;

    if (agentDid) {
      blockchainInfo.isOnChainRegistered = await isAgentRegistered(agentDid);
      blockchainInfo.onChainCompanyDid = blockchainInfo.isOnChainRegistered
        ? await getAgentCompany(agentDid)
        : null;
    }
  }
  res.json({ success: true, user,blockchainInfo });
});


const updateUser = asyncHandler(async (req, res) => {
  const { wallet_address } = req.params;
  const updates = req.body;

  const user = await User.findOne({ wallet_address })
    .populate("customer")
    .populate("agent")
    .populate("company");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  const userFields = ["email", "role"];
  userFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  let roleDoc = null;

  if (user.role === "customer" && user.customer) {
    roleDoc = await Customer.findById(user.customer);

    const allowed = [
      "customer_name",
      "customer_phone",
      "customer_email",
      "address",
      "dateOfBirth"
    ];

    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        roleDoc[field] = updates[field];
      }
    });

    await roleDoc.save();
  }

  if (user.role === "agent" && user.agent) {
    roleDoc = await Agent.findById(user.agent);

    const allowed = [
      "agent_name",
      "agent_phone",
      "agent_email",
      "licenseNumber",
    ];

    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        roleDoc[field] = updates[field];
      }
    });

    await roleDoc.save();
  }

  if (user.role === "company" && user.company) {
    roleDoc = await Company.findById(user.company);

    const allowed = [
      "company_name",
      "company_email",
    ];

    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        roleDoc[field] = updates[field];
      }
    });

    await roleDoc.save();
  }

  await user.save();

  const updatedUser = await User.findOne({ wallet_address })
    .populate("customer")
    .populate("agent")
    .populate("company");

  return res.status(200).json({
    success: true,
    message: "User updated successfully!",
    user: updatedUser,
  });
  
});
export {
  register, login, getUser,updateUser
};