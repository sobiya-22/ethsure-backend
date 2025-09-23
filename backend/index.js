import express from "express";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import connectDB from "./utils/connectDB.js";
import dotenv from "dotenv";
import companyRoutes from "./routes/company.route.js";
import fs from "fs";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use("/api/company", companyRoutes);

app.get("/.well-known/jwks.json", (req, res) => {
  const jwks = fs.readFileSync("jwks.json", "utf8");
  res.setHeader("Content-Type", "application/json");
  res.send(jwks);
});

app.listen(PORT, () => {
  console.log("backend running on port 4000");
  connectDB();
});