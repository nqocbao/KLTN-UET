import { Request, Response } from "express";
import Province from "../../models/provinces.model.js";

// Get all provinces
export const getAllProvinces = async (req: Request, res: Response) => {
  try {
    const { country_id } = req.query;
    const filter = country_id ? { country_id } : {};

    const provinces = await Province.find(filter).populate("country_id");
    res.status(200).json({ success: true, data: provinces });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get province by ID
export const getProvinceById = async (req: Request, res: Response) => {
  try {
    const province = await Province.findById(req.params.id).populate(
      "country_id"
    );

    if (!province) {
      return res.status(404).json({
        success: false,
        message: "Province not found",
      });
    }

    res.status(200).json({ success: true, data: province });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create province
export const createProvince = async (req: Request, res: Response) => {
  try {
    const province = await Province.create(req.body);
    res.status(201).json({ success: true, data: province });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update province
export const updateProvince = async (req: Request, res: Response) => {
  try {
    const province = await Province.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!province) {
      return res.status(404).json({
        success: false,
        message: "Province not found",
      });
    }

    res.status(200).json({ success: true, data: province });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete province
export const deleteProvince = async (req: Request, res: Response) => {
  try {
    const province = await Province.findByIdAndDelete(req.params.id);

    if (!province) {
      return res.status(404).json({
        success: false,
        message: "Province not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Province deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
