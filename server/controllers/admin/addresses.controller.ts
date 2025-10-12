import { Request, Response } from "express";
import Address from "../../models/addresses.model.js";

// Get all addresses
export const getAllAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await Address.find()
      .populate("country_id")
      .populate("province_id")
      .populate("district_id")
      .populate("ward_id");

    res.status(200).json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get address by ID
export const getAddressById = async (req: Request, res: Response) => {
  try {
    const address = await Address.findById(req.params.id)
      .populate("country_id")
      .populate("province_id")
      .populate("district_id")
      .populate("ward_id");

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({ success: true, data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create address
export const createAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.create(req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({ success: true, data: address });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
