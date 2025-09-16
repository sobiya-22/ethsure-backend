import express from "express";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import connectDB from "./utils/connectDB.js";
import dotenv from "dotenv";
import companyRoutes from "./routes/company.route.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/company", companyRoutes);
app.listen(4000, () => {
  console.log("backend running on port 4000");
  connectDB();
  // console.log("private kyey is ",process.env.PRIVATE_KEY)
});