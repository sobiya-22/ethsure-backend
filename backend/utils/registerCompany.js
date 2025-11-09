import { registerCompanyOnChain } from "../blockchain/agentRegistry.js";
import dotenv from "dotenv";
dotenv.config();
const COMPANY_DID = process.env.COMPANY_DID;

await registerCompanyOnChain(COMPANY_DID);