import { get } from "http";
import { registerCompany,getCompanies } from "../controllers/company.controller.js";
import express from "express";

const router = express.Router();

router.post("/register-company", registerCompany);

router.get("/", getCompanies);

export default router;