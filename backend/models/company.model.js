import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    company_name: {
        type: String,
        required: true,
        trim: true,
    },
    company_did: {
        type: String,
        required: true,
        // unique: true,
        trim: true,
    },
    wallet_address: {
        type: String,
        required: true,
        unique: true,
    },
    profile_photo_url: {
        type: String,
        default: null,
    },
    singleton: {
        type: Boolean,
        default: true,
        unique: true
    },
    registration_date: { type: Date, default: Date.now },
},

    { timestamps: true }
);

export default mongoose.model("Company", CompanySchema);
