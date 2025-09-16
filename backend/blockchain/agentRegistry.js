import { getContract } from "./config.js";

const registryAddress = process.env.REGISTRY_ADDRESS;
const abiPath = "artifacts/contracts/AgentRegistry.sol/AgentRegistry.json";

// Register a company DID to the caller's wallet
export const registerCompanyOnChain = async (companyDid) => {
  const registry = await getContract(registryAddress, abiPath);
  const tx = await registry.registerCompany(companyDid);
  await tx.wait();
  return tx.hash;
};

// Register an agent under a company
export const registerAgentOnChain = async (companyDid, agentDid, vcHash) => {
  const registry = await getContract(registryAddress, abiPath);
  const tx = await registry.registerAgent(companyDid, agentDid, vcHash);
  await tx.wait();
  return tx.hash;
};

// Revoke an agent
export const revokeAgentOnChain = async (agentDid) => {
  const registry = await getContract(registryAddress, abiPath);
  const tx = await registry.revokeAgent(agentDid);
  await tx.wait();
  return tx.hash;
};

// Get the company DID associated with an agent
export const getAgentCompany = async (agentDid) => {
  const registry = await getContract(registryAddress, abiPath);
  const companyDid = await registry.getAgentCompany(agentDid);
  return companyDid;
};

// Get VC hash of an agent
export const getAgentVcHash = async (agentDid) => {
  const registry = await getContract(registryAddress, abiPath);
  const vcHash = await registry.agentVcHash(agentDid);
  return vcHash;
};

// Check if a company is registered
export const isCompanyRegistered = async (companyDid) => {
  const registry = await getContract(registryAddress, abiPath);
  const owner = await registry.companyOwner(companyDid);
  return owner !== "0x0000000000000000000000000000000000000000";
};

// Check if an agent is registered
export const isAgentRegistered = async (agentDid) => {
  const registry = await getContract(registryAddress, abiPath);
  const companyDid = await registry.agentToCompany(agentDid);
  return companyDid !== "";
};