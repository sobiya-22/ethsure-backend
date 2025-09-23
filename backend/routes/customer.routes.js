import express from "express";
import { submitCustomerKYC , getAllCustomers , getCustomer , checkCustomerKYCStatus } from "../controllers/customer.controller.js";
const router = express.Router();

//router.post("/register", registerOrGetAgent);
router.post("/kyc", submitCustomerKYC);
router.get("/kyc-status/:wallet_address", checkCustomerKYCStatus );
router.get("/:wallet_address", getCustomer);
router.get("/",getAllCustomers);


export default router;
