import type { Request, Response } from "express";
import Tour from "../../models/tours.model.js";

// Get all tours
export const getAllTours = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const { country_id, guide_id } = req.query;
    const filter: any = {};

    if (country_id) filter.country_id = country_id;
    if (guide_id) filter.guide_id = guide_id;

    const tours = await Tour.find(filter)
      .populate("country_id")
      .populate("guide_id")
      .skip(skip)
      .limit(limit);

    const total = await Tour.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tours,
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

// Get tour by ID
export const getTourById = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate("country_id")
      .populate("guide_id");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create tour
export const createTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ success: true, data: tour });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update tour
export const updateTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete tour
export const deleteTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
