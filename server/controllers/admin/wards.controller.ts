import { Request, Response } from "express";
import Ward from "../../models/wards.model.js";

// Get all wards
export const getAllWards = async (req: Request, res: Response) => {
  try {
    const { district_id } = req.query;
    const filter = district_id ? { district_id } : {};

    const wards = await Ward.find(filter).populate("district_id");
    res.status(200).json({ success: true, data: wards });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get ward by ID
export const getWardById = async (req: Request, res: Response) => {
  try {
    const ward = await Ward.findById(req.params.id).populate("district_id");

    if (!ward) {
      return res.status(404).json({
        success: false,
        message: "Ward not found",
      });
    }

    res.status(200).json({ success: true, data: ward });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create ward
export const createWard = async (req: Request, res: Response) => {
  try {
    const ward = await Ward.create(req.body);
    res.status(201).json({ success: true, data: ward });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update ward
export const updateWard = async (req: Request, res: Response) => {
  try {
    const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ward) {
      return res.status(404).json({
        success: false,
        message: "Ward not found",
      });
    }

    res.status(200).json({ success: true, data: ward });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete ward
export const deleteWard = async (req: Request, res: Response) => {
  try {
    const ward = await Ward.findByIdAndDelete(req.params.id);

    if (!ward) {
      return res.status(404).json({
        success: false,
        message: "Ward not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ward deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
