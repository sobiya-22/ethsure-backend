import API from "./axiosInstance";

// Submit Agent KYC
export const submitAgentKYC = (data) => API.post("/agent/kyc", data);

// Get Agent details
export const getAgent = (walletAddress) => API.get(`/agent/${walletAddress}`);

// Get Agent KYC status
export const getAgentKYCStatus = (walletAddress) =>
  API.get(`/agent/kyc-status/${walletAddress}`);
