import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers/providers";
import dotenv from "dotenv"
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const SEPOLIA_RPC ='https://sepolia.infura.io/v3/5cb89a6d2e2c4340b5cf62694bde378f';
const PRIVATE_KEY ='db395bd00102c8e9af7f495735656b36db8026d25a408628cc98c7be16c78161';
// Provider and Wallet
export const provider = new JsonRpcProvider(SEPOLIA_RPC);
export const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

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