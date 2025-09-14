import express from "express";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

dotenv.config();
const app = express();
app.use(express.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sepolia RPC + private key
const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Registry ABI + Address
const registryAbiPath = path.join(__dirname, "../../artifacts/contracts/AgentRegistry.sol/AgentRegistry.json");
const registryAbiRaw = await fs.readFile(registryAbiPath, "utf-8");
const registryAbi = JSON.parse(registryAbiRaw);
const registryAddress = process.env.REGISTRY_ADDRESS;
const registry = new ethers.Contract(registryAddress, registryAbi.abi, wallet);

// Endpoint to register company
app.post("/register-company", async (req, res) => {
  try {
    const { companyDid } = req.body;
    const tx = await registry.registerCompany(companyDid);
    await tx.wait();
    res.json({ status: "Company registered", txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(4000, () => {
  console.log("Company backend running on port 4000");
});