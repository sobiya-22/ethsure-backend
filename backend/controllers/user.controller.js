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
});
