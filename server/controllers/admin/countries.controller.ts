import type { Request, Response } from "express";
import Country from "../../models/countries.model.js";

// Get all countries
export const getAllCountries = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const countries = await Country.find()
      .skip(skip)
      .limit(limit);

    const total = await Country.countDocuments();

    res.status(200).json({
      success: true,
      data: countries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get country by ID
export const getCountryById = async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found",
      });
    }

    res.status(200).json({ success: true, data: country });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create country
export const createCountry = async (req: Request, res: Response) => {
  try {
    const country = await Country.create(req.body);
    res.status(201).json({ success: true, data: country });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update country
export const updateCountry = async (req: Request, res: Response) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found",
      });
    }

    res.status(200).json({ success: true, data: country });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete country
export const deleteCountry = async (req: Request, res: Response) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Country deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
