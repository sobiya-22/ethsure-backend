import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  wallet_address: {
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
    enum: ["customer", "agent", "company", "nominee"], // restricts allowed values
    default: null
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
