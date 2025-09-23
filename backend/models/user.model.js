import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    user_did: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    wallet_address: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    name: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },

    role: {
      type: String,
      enum: ["customer", "agent", "admin"],
      default: null, // null until user selects role
    },

    // Link to role-specific collection (Agent or Customer)
    role_model: { type: String, enum: ["Customer", "Agent", null], default: null },
    role_ref: { type: mongoose.Schema.Types.ObjectId, refPath: "role_model", default: null },
    
    kyc_completed: { type: Boolean, default: false },

    profile_photo_url: { type: String, default: null },

    registration_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
