import { asyncHandler } from "../utils/asyncHandler.js";
import Customer from "../models/customer.model.js"; 

//get customer
const getCustomer = asyncHandler(async (req, res) => {

  const { wallet_address } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ 
      success: false, 
      message: "Wallet address is required" 
    });
  }

  const customer = await Customer.findOne({ wallet_address: wallet_address.toLowerCase() });

  if (!customer) {
    return res.status(404).json({ 
      success: false, 
      message: "Customer not found" });
  }

  res.status(200).json({ success: true, data: customer });
});


//update customer
const updateCustomer = asyncHandler(async (req, res) => {
  const { wallet_address, updateData } = req.body;

  if (!wallet_address) {

    return res.status(400).json({ 
      success: false, 
      message: "Wallet address is required" });
  }

  const customer = await Customer.findOneAndUpdate(
    { wallet_address: wallet_address.toLowerCase() },
    updateData,
    { new: true }
  );

  if (!customer) {
    return res.status(404).json({ 
      success: false, 
      message: "Customer not found" });
  }

  res.status(200).json({ 
    success: true, 
    data: customer });
});

export {getCustomer , updateCustomer};