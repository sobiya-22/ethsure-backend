import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    policy_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    policy_name: {
        type: String,
        required: true,
        trim: true
    },
    policy_type: {
        type: String,
        required: true,
        enum: ["life", "health", "auto", "home", "travel", "business"],
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    coverage_amount: {
        type: Number,
        required: true,
        min: 0
    },
    premium_amount: {
        type: Number,
        required: true,
        min: 0
    },
    premium_frequency: {
        type: String,
        enum: ["monthly", "quarterly", "semi-annual", "annual"],
        default: "monthly"
    },
    policy_duration: {
        type: Number, // in years
        required: true,
        min: 1
    },
    eligibility_criteria: {
        min_age: {
            type: Number,
            default: 18
        },
        max_age: {
            type: Number,
            default: 65
        },
        other_requirements: {
            type: String,
            default: ""
        }
    },
    terms_and_conditions: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model("Policy", PolicySchema);