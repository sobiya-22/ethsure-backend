import { asyncHandler } from "../utils/asyncHandler.js";
import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";

// customer submits KYC (this is "submission" - status: pending). admin will verify later.

const submitCustomerKYC = asyncHandler(async (req, res) => {

  let { wallet_address, customer_name, customer_email, customer_phone, customer_address, date_of_birth, profile_photo_url, id_document_url } = req.body;


  if (!wallet_address) return res.status(400).json({ 
    success: false, 
    message: "wallet_address required"
   });

  wallet_address = wallet_address.toLowerCase();


  const customer = await Customer.findOneAndUpdate(
    { wallet_address },
    {
      customer_name: customer_name || "",
      customer_email: customer_email || "",
      customer_phone: customer_phone || "",
      customer_address: customer_address || "",
      date_of_birth: date_of_birth || null,
      profile_photo_url: profile_photo_url || null,
      id_document_url: id_document_url || null,
      kyc_status: "verified"
    },
    { new: true }
  );

  if (!customer) return res.status(404).json({ success: false, message: "Customer role not found; select role first" });

  return res.status(200).json({ success: true, message: "KYC submitted ", customer });
});



const getCustomer = asyncHandler(async (req, res) => {
  const { wallet_address } = req.params;

  const customer = await Customer.findOne({ wallet_address: wallet_address.toLowerCase() });

  if (!customer) return res.status(404).json({  
     success: false,
     message: "Customer not found" });

    res.status(200).json({ success: true, data: customer });
});



const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find();

  res.status(200).json({ 
    success: true, 
    data: customers });
});


// Check KYC status for customer
const checkCustomerKYCStatus = asyncHandler(async (req, res) => {
  const { wallet_address } = req.params;
  if (!wallet_address) return res.status(400).json({ success: false, message: "wallet_address required" });

  const customer = await Customer.findOne({ wallet_address });
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

  return res.status(200).json({
    success: true,
    wallet_address,
    kyc_status: customer.kyc_status,
  });
});


export { submitCustomerKYC, getCustomer, getAllCustomers , checkCustomerKYCStatus};

