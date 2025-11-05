import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
    unique: true, // ensures one account per wallet
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    default: null
  },
  role: {
    type: String,
    enum: ["customer", "agent", "company", "nominee"], // restricts allowed values
    default: null
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
  // nominee: { type: mongoose.Schema.Types.ObjectId, ref: "Nominee", default: null },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
