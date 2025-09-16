import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true, // ensures one account per wallet
    lowercase: true,
    trim: true
  },
//   did: {
//     type: String,
//     default: null
//   },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    default: null
    },
  role: {
    type: String,
    enum: ["customer", "agent", "company", "admin"], // restricts allowed values
    default: "customer"
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
