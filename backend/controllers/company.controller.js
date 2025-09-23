// controllers/company.controller.js
import companyModel from "../models/company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerCompanyOnChain } from "../blockchain/agentRegistry.js";

export const registerCompany = asyncHandler(async (req, res) => {
  try {
    const { companyDid, company_name, wallet_address, logo_url } = req.body;

    const txHash = await registerCompanyOnChain(companyDid);

    const newCompany = new companyModel({ company_name, wallet_address, logo_url });
    await newCompany.save();

    res.status(201).json({ message: "Company registered successfully", company: newCompany, txHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//demo to check api for companies (remove later as n when reqiuried)
export const getCompanies = asyncHandler(async (req, res) => {
  try {
    const companies = await companyModel.find();
    if (!companies.length) {
      return res.status(404).json({ message: "No companies found" });
    }
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});