import mongoose from "mongoose";

const PolicyRequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        required: true
    },
    policy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Policy",
        required: true
    },
    request_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    customer_details: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        date_of_birth: {
            type: Date,
            required: true
        },
        occupation: {
            type: String,
            trim: true
        },
        annual_income: {
            type: Number,
            min: 0
        }
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending"
    },
    requested_coverage_amount: {
        type: Number
    },
    documents_submitted: [{
        document_name: String,
        document_url: String,
        upload_date: {
            type: Date,
            default: Date.now
        }
    }],
    request_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model("PolicyRequest", PolicyRequestSchema);