import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

// Provider and Wallet
export const provider = new JsonRpcProvider(SEPOLIA_RPC);
export const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

// ABI loader
export const loadAbi = async (relativePath) => {
  const fullPath = path.join(__dirname, "..", relativePath);
  const raw = await fs.readFile(fullPath, "utf-8");
  const parsed = JSON.parse(raw);
  return parsed;
};

// Contract factory
export const getContract = async (address, abiPath) => {
  const abi = await loadAbi(abiPath);
  return new ethers.Contract(address, abi, wallet);
};