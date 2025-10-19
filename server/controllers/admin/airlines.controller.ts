import type { Request, Response } from "express";
import Airline from "../../models/airlines.model.js";

// Get all airlines
export const getAllAirlines = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const { country } = req.query;
    const filter = country ? { country } : {};

    const airlines = await Airline.find(filter)
      .populate("partner_id")
      .populate("address_id")
      .skip(skip)
      .limit(limit);

    const total = await Airline.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: airlines,
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

// Get airline by ID
export const getAirlineById = async (req: Request, res: Response) => {
  try {
    const airline = await Airline.findById(req.params.id)
      .populate("partner_id")
      .populate("address_id");

    if (!airline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found",
      });
    }

    res.status(200).json({ success: true, data: airline });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create airline
export const createAirline = async (req: Request, res: Response) => {
  try {
    const airline = await Airline.create(req.body);
    res.status(201).json({ success: true, data: airline });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update airline
export const updateAirline = async (req: Request, res: Response) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!airline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found",
      });
    }

    res.status(200).json({ success: true, data: airline });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete airline
export const deleteAirline = async (req: Request, res: Response) => {
  try {
    const airline = await Airline.findByIdAndDelete(req.params.id);

    if (!airline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Airline deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
