import express from "express";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import connectDB from "./utils/connectDB.js";
import dotenv from "dotenv";
import userRoutes from './routes/user.route.js'
import kycRoutes from "./routes/kyc.route.js"
import companyRoutes from "./routes/company.route.js";
import agentRoutes from "./routes/agent.route.js";
import customerRoutes from "./routes/customer.route.js"

import fs from "fs";
import cors from "cors";
dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173","https://unamiably-unperverted-rickey.ngrok-free.dev"],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/kyc" , kycRoutes );
app.use("/api/agent" , agentRoutes);
app.use("/api/customer" , customerRoutes);

app.get("/.well-known/jwks.json", (req, res) => {
  const jwks = fs.readFileSync("jwks.json", "utf8");
  res.setHeader("Content-Type", "application/json");
  res.send(jwks);
});

app.listen(PORT, () => {
  console.log("backend running on port 5000");
  connectDB();
});