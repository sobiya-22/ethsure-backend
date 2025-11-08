import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },
    customer_wallet_address: {
        type: String,
        required: true,
        index: true
    },
    agent_wallet_address: {
        type: String,
        required: true,
        index: true
    },

    // Policy dates - automatically handled
    issueDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        // Will be set automatically to 10 years from issueDate
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
        match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhar number']
    },
    panNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
    },

    // Financial Info
    annualIncome: {
        type: Number,
        required: true,
        min: 0
    },
    occupation: {
        type: String,
        enum: ["Salaried", "Self-Employed", "Business", "Student", "Retired", "Other"],
        required: true,
    },
    coverage_amount: {
        type: Number,
        default: 1000000,
        min: 0
    },
    premium_amount: {
        type: Number,
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
        default: 10, // Default 10 years to match expiry date
        min: 1
    },

    // Policy status
    status: {
        type: String,
        enum: ["created", "agentApproved", "active", "claimed", "cancelled", "expired"],
        default: "created"
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    nominee:{
        nominee_name:{
            type: String,
            required: true,
            trim: true
        },
        nominee_age: {
            type: Number,
            required: true,
            min: 0
        },
        nominee_relation:{
            type:String,
            required:true
        }
    },
    policy_VC:{
        type:JSON
    },
    txn_hash:{
        type:String
    },
    onchain_policyID:{
        type: Number
    }
}, {
    timestamps: true
});

PolicySchema.pre('save', function (next) {
    // Set expiry date to 10 years from issue date
    if (this.isNew) {
        const issueDate = this.issueDate || new Date();
        const expiryDate = new Date(issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 10);
        this.expiryDate = expiryDate;
        this.policy_duration = 10;
    }
    next();
});

PolicySchema.index({ customer_wallet_address: 1, status: 1 });
PolicySchema.index({ agent_wallet_address: 1, status: 1 });
// PolicySchema.index({ _id: 1 }); // Using _id as policy number

export default mongoose.model("Policy", PolicySchema);