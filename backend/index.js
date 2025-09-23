import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./utils/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);


app.listen(process.env.PORT || 8000, () => {
    connectDB();
    console.log(`Server listening on ${process.env.PORT || 8000}`);
/*
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import connectDB from "./utils/connectDB.js";
import dotenv from "dotenv";
import companyRoutes from "./routes/company.route.js";
import fs from "fs";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/company", companyRoutes);

app.get("/.well-known/jwks.json", (req, res) => {
  const jwks = fs.readFileSync("jwks.json", "utf8");
  res.setHeader("Content-Type", "application/json");
  res.send(jwks);
});

app.listen(4000, () => {
  console.log("backend running on port 4000");
  connectDB();
*/
});