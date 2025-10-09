import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
<<<<<<< Updated upstream
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
    description: {
        type: String,
=======
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent"
    },
    issueDate: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
    },

    // Personal Details
    fullName: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
    },
    maritalStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    address: {
        type: String,
        required: true,
    },

    // Identification
    aadharNumber: {
        type: String,
        required: true,
        unique: true,
    },
    panNumber: {
        type: String,
        required: true,
        unique: true,
    },
    nominee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nominee",
    },
    // Financial Info
    annualIncome: {
        type: Number,
        required: true,
    },
    occupation: {
        type: String,
        enum: ["Salaried", "Self-Employed", "Business", "Student", "Retired", "Other"],
>>>>>>> Stashed changes
        required: true,
    },
    coverage_amount: {
        type: Number,
        required: true,
        default: 1000000,
        min: 0
    },
    premium_amount: {
        type: Number,
        required: true,
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
        required: true,
        default: 20,
        min: 1
    },
    status: {
        type: String,
<<<<<<< Updated upstream
        enum: ["created", "active", "ongoing", "claimed", "cancelled", "expired"],
        default: "created"
    },
    is_active: {
        type: Boolean,
        default: true
    },
=======
        enum: ["created", "active", "ongoing", "claimed", "cancelled"],
    },  
>>>>>>> Stashed changes
    created_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model("Policy", PolicySchema);
