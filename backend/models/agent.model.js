import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    agent_did: {
      type: String,
      // unique: true,
      trim: true,
    },
    wallet_address: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    //filled during KYC
    agent_name: {
      type: String,
      default: "",
      trim: true
    },

    agent_email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true
    },
    agent_phone: {
      type: String,
      default: "",
      trim: true
    },
    license_number: {
      type: String,
      default: "",
      trim: true
    },

    profile_photo_url: {
      type: String,
      default: null
    },

    // KYC & approval
    kyc_status: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
    is_approved: {
      type: Boolean,
      default: false
    },

    registration_date: {
      type: Date,
      default: Date.now
    },
    association_requests: [
    {
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      request_date: { type: Date, default: Date.now },
      response_date: { type: Date }
    }
  ]
  ,
   policy_requests: [
    {
        customer_wallet_address: { 
            type: String, 
            required: true 
        },
        policy_id: { 
            type: String, 
            required: true 
        },
        policy_name: { type: String },
        status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
        },
        request_date: { 
            type: Date, 
            default: Date.now 
        },
        response_date: { type: Date }
    }
    ],
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Agent", AgentSchema);
