import type { Request, Response } from "express";
import Hotel from "../../models/hotels.model.js";

// Get all hotels
export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const hotels = await Hotel.find()
      .populate("partner_id")
      .populate("address_id")
      .skip(skip)
      .limit(limit);

    const total = await Hotel.countDocuments();

    res.status(200).json({
      success: true,
      data: hotels,
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

// Get hotel by ID
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("partner_id")
      .populate("address_id");

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create hotel
export const createHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update hotel
export const updateHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete hotel
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
