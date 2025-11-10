import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ENV values
const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const COMPANY_PRIVATE_KEY = process.env.COMPANY_PRIVATE_KEY;

// Provider
export const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

// Wallets
export const deployerWallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
export const companyWallet = new ethers.Wallet(COMPANY_PRIVATE_KEY, provider);

// ABI loader
export const loadAbi = async (relativePath) => {
  const fullPath = path.join(__dirname, "..", relativePath);
  const raw = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(raw);
};

/**
 * Get contract instance with correct signer
 * @param {string} address  - Contract address
 * @param {string} abiPath  - Path to ABI JSON
 * @param {boolean} useCompany - true => use company wallet, false => deployer wallet
 */
export const getContract = async (address, abiPath, useCompany = false) => {
  const abi = await loadAbi(abiPath);
  const signer = useCompany ? companyWallet : deployerWallet;
  return new ethers.Contract(address, abi, signer);
};
