import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
    // policy_name: {
    //     type: String,
    //     // required: true,
    //     trim: true
    // },
    // description: {
    //     type: String,
    //     // required: true,
    //     trim: true
    // },
     policy_id: {
        type: String,
        unique: true,
        required: true,
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
     customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Customer" 
    },
    agent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Agent" 
    },
    status: {
        type: String,
        enum: ["not-active", "created", "active", "ongoing", "claimed", "cancelled"],
        default: "not-active"
    },
    nominee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nominee",
        default: null
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