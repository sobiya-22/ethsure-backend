import API from "./axiosInstance";

export const getPendingAgentKYCs = () => API.get("/admin/agents/pending");

export const approveAgent = (agentId) =>
  API.put(`/admin/agents/approve/${agentId}`);

export const rejectAgent = (agentId, reason) =>
  API.put(`/admin/agents/reject/${agentId}`, { reason });
