import { getContract, loadAbi } from "./config.js";

const registryAddress = process.env.POLICY_REGISTRY_ADDRESS;
const abiPath = "../config/PolicyABI.json";

console.log(await loadAbi("/config/PolicyABI.json"));

/**
 * Create a new policy on-chain
 */
export const createPolicyOnChain = async (customerAddress, customerDid, vcHash) => {
  const registry = await getContract(registryAddress, abiPath);

  const tx = await registry.createPolicy(customerAddress, customerDid, vcHash);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    policyId: Number(receipt.logs[0]?.args?.policyId || 0), // safest
  };
};

/**
 * Claim a policy (customer only)
 */
export const claimPolicyOnChain = async (policyId) => {
  const registry = await getContract(registryAddress, abiPath);

  const tx = await registry.claimPolicy(policyId);
  await tx.wait();

  return tx.hash;
};

/**
 * Update VC hash (customer only)
 */
export const updatePolicyVcHashOnChain = async (policyId, newVcHash) => {
  const registry = await getContract(registryAddress, abiPath);

  const tx = await registry.updateVcHash(policyId, newVcHash);
  await tx.wait();

  return tx.hash;
};

/**
 * Get complete policy details
 */
export const getPolicyOnChain = async (policyId) => {
  const registry = await getContract(registryAddress, abiPath);

  const data = await registry.getPolicy(policyId);

  return {
    customer: data[0],
    customerDid: data[1],
    vcHash: data[2],
    isActive: data[3],
  };
};

/**
 * Check if a policy exists
 */
export const isPolicyExists = async (policyId) => {
  const registry = await getContract(registryAddress, abiPath);

  const customer = await registry.policyCustomer(policyId);
  return customer !== "0x0000000000000000000000000000000000000000";
};

/**
 * Get next policy ID (useful for UI previews)
 */
export const getNextPolicyId = async () => {
  const registry = await getContract(registryAddress, abiPath);
  return Number(await registry.nextPolicyId());
};

