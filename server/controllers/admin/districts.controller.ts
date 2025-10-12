import { Request, Response } from "express";
import District from "../../models/districts.model.js";

// Get all districts
export const getAllDistricts = async (req: Request, res: Response) => {
  try {
    const { province_id } = req.query;
    const filter = province_id ? { province_id } : {};

    const districts = await District.find(filter).populate("province_id");
    res.status(200).json({ success: true, data: districts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get district by ID
export const getDistrictById = async (req: Request, res: Response) => {
  try {
    const district = await District.findById(req.params.id).populate(
      "province_id"
    );

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found",
      });
    }

    res.status(200).json({ success: true, data: district });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create district
export const createDistrict = async (req: Request, res: Response) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json({ success: true, data: district });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update district
export const updateDistrict = async (req: Request, res: Response) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found",
      });
    }

    res.status(200).json({ success: true, data: district });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete district
export const deleteDistrict = async (req: Request, res: Response) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "District deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
