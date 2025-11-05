// import mongoose from "mongoose";

// const NomineeSchema = new mongoose.Schema(
//   {
//     nominee_name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     nominee_age: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     nominee_email: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
//     },
//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customer",
//       required: true
//     },
//     policy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Policy",
//       required: true
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Nominee", NomineeSchema);
