import { asyncHandler } from "../utils/asyncHandler.js";
import Agent from "../models/agent.model.js";
import Policy from "../models/policy.model.js"
import Company from "../models/company.model.js";
import { issueAgentVC } from "../VC/createVC.js";
import { registerAgentOnChain } from "../blockchain/agentRegistry.js";

const COMPANY_DID = process.env.COMPANY_DID;

const sendAssociationRequest = asyncHandler(async (req, res) => {
  const { data } = req.body;
  console.log(data);
  if (!data.agent_wallet_address) {
    return res.status(400).json({
      success: false,
      message: "Agent wallet address is required",
    });
  }
  if (!data.license_number) {
    return res.status(400).json({
      success: false,
      message: "License Number is required",
    });
  }
  if (!data.aadharcard_url || !data.pancard_url || !data.license_url) {
    return res.status(400).json({
      success: false,
      message: "Upload all documents required to proceed",
    });
  }
  if (!data.terms_accepted) {
    return res.status(400).json({
      success: false,
      message: "First approve our terms and conditions",
    });
  }

  const agent = await Agent.findOne({ wallet_address: data.agent_wallet_address });

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  if (agent.kyc_status !== "verified") {
    return res.status(400).json({
      success: false,
      message: "KYC must be verified before associating with company",
    });
  }
  agent.license_number = data.license_number;
  agent.documents = {
    aadharcard_url: data.aadharcard_url,
    pancard_url: data.pancard_url,
    license_url: data.license_url
  }
  agent.associated_company = {
    company: process.env.COMPANY_MONGODB_ID, // hardcoded value
    status: "pending",
    request_date: new Date(),
  };

  await agent.save();

  res.status(200).json({
    success: true,
    message: "Association request sent to company successfully.",
    data: {
      agent_wallet_address: agent.wallet_address,
      company_id: agent.associated_company.company,
      status: agent.associated_company.status,
    },
  });
});


//Get list of agents 
const getAllAgents = asyncHandler(async (req, res) => {
  const { status } = req.query;
  console.log("status: ", status);
  if (!status) {
    return res.status(400).json({
      success: false,
      message: "status fields are required",
    });
  }

  const filter = {
    "associated_company.status": status,
  };

  const agents = await Agent.find({
    "associated_company.status": status,
  })
    .populate("user")
    .populate("associated_company.company");

  res.json({
    success: true,
    count: agents.length,
    agents,
  });
});


const updateAgentAssociationStatus = asyncHandler(async (req, res) => {
  const { agent_wallet_address } = req.body;
  const { newStatus } = req.query;
  console.log(req.body, req.query);
  const validStatuses = ["approved", "rejected"];

  if (!newStatus || !validStatuses.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Allowed: approved | rejected"
    });
  }

  // Fetch agent
  const agent = await Agent.findOne({ wallet_address: agent_wallet_address });
  console.log(agent)
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  // Check if there's a pending request
  if (agent.associated_company.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `Cannot update status because the current status is '${agent.associated_company.status}'. Only pending requests can be updated.`
    });
  }


  // Update status
  let blockchainTxn = null;
  agent.associated_company.status = newStatus;

  if (newStatus === 'approved') {
    //issue agent vc
    const agentVC = await issueAgentVC({
      agentDid: agent.agent_did,
      companyDid: COMPANY_DID,
      name: agent.agent_name,
      licenseNumber: agent.license_number
    });

    console.log(agentVC);
    agent.is_approved = true;
    blockchainTxn = await registerAgentOnChain(COMPANY_DID, agent.agent_did, agentVC.hash);
    agent.associated_company.agent_VC = agentVC;
    agent.associated_company.txn_hash = blockchainTxn;
  }

  await agent.save();

  res.status(200).json({
    success: true,
    message: `Company association request ${newStatus}.`,
    agent,
    blockchainTxn
  });
});
export { sendAssociationRequest, getAllAgents, updateAgentAssociationStatus }
