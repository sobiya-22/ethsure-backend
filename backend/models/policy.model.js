import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
    policy_name: {
        type: String,
        // required: true,
        trim: true
    },
    description: {
        type: String,
        // required: true,
        trim: true
    },
    coverage_amount: {
        type: Number,
        // required: true,
        default: 1000000,
        min: 0
    },
    premium_amount: {
        type: Number,
        // required: true,
        default: 50000,
        min: 0
    },
    premium_frequency: {
        type: String,
        enum: ["monthly", "quarterly", "semi-annual", "annual"],
        default: "annual"
    },
    policy_duration: {
        type: Number,
        // required: true,
        default: 20,
        min: 1
    },
    status: {
        type: String,
        enum: ["not-active", "created", "active", "ongoing", "claimed", "cancelled"],
        default: "not-active"
    },
    created_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model("Policy", PolicySchema);