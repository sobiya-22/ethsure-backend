import { getContract, loadAbi } from "./config.js";

const POLICY_REGISTRY_ADDRESS = process.env.POLICY_REGISTRY_ADDRESS;
const abiPath = "./config/PolicyABI.json";

/**
 * Create a new policy on-chain
 */
export const createPolicyOnChain = async (customerAddress, customerDid, vcHash) => {
  const registry = await getContract(POLICY_REGICTRY_ADDRESS, abiPath);

  const tx = await registry.createPolicy(customerAddress, customerDid, vcHash);
  const receipt = await tx.wait();
    const event = receipt.logs
    .map(log => {
        try { return registry.interface.parseLog(log); }
        catch { return null; }
    })
    .find(parsed => parsed && parsed.name === "PolicyCreated");

  if (!event) throw new Error("PolicyCreated event not found");

  const policyId = event.args.policyId.toString();
  return {
    txHash: tx.hash,
    policyId,
  };
};

/**
 * Claim a policy (customer only)
 */
export const claimPolicyOnChain = async (policyId) => {
  const registry = await getContract(POLICY_REGICTRY_ADDRESS, abiPath);

  const tx = await registry.claimPolicy(policyId);
  await tx.wait();

  return tx.hash;
};

/**
 * Update VC hash (customer only)
 */
export const updatePolicyVcHashOnChain = async (policyId, newVcHash) => {
  const registry = await getContract(POLICY_REGICTRY_ADDRESS, abiPath);

  const tx = await registry.updateVcHash(policyId, newVcHash);
  await tx.wait();

  return tx.hash;
};

/**
 * Get complete policy details
 */
export const getPolicyOnChain = async (policyId) => {
  const registry = await getContract(POLICY_REGICTRY_ADDRESS, abiPath);

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
  const registry = await getContract(POLICY_REGICTRY_ADDRESS, abiPath);

  const customer = await registry.policyCustomer(policyId);
  return customer !== "0x0000000000000000000000000000000000000000";
};

/**
 * Get next policy ID 
 */
export const getNextPolicyId = async () => {
  const registry = await getContract(POLICY_REGICTRY_ADDRESS, abiPath);
  return Number(await registry.nextPolicyId());
};

