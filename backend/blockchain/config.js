import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Provider + Wallet
export const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI loader
export const loadAbi = async (relativePath) => {
  const fullPath = path.join(__dirname, "..", relativePath);
  const raw = await fs.readFile(fullPath, "utf-8");
  const parsed = JSON.parse(raw);
  return parsed.abi;
};

// Contract factory
export const getContract = async (address, abiPath) => {
  const abi = await loadAbi(abiPath);
  return new ethers.Contract(address, abi, wallet);
};