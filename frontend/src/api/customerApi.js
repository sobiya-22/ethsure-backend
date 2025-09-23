import API from "./axiosInstance";

// Register or get customer
export const registerCustomer = (data) => API.post("/customer/register", data);

// Submit KYC
export const submitCustomerKYC = (data) => API.post("/customer/kyc", data);

// Get KYC status
export const getCustomerKYCStatus = (walletAddress) =>
  API.get(`/customer/kyc-status/${walletAddress}`);
