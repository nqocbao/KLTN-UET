import type { Request, Response } from "express";
import Guide from "../../models/guides.model.js";

// Get all guides
export const getAllGuides = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const guides = await Guide.find()
      .populate("user_id")
      .populate("address_id")
      .skip(skip)
      .limit(limit);

    const total = await Guide.countDocuments();

    res.status(200).json({
      success: true,
      data: guides,
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

// Get guide by ID
export const getGuideById = async (req: Request, res: Response) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate("user_id")
      .populate("address_id");

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    res.status(200).json({ success: true, data: guide });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create guide
export const createGuide = async (req: Request, res: Response) => {
  try {
    const guide = await Guide.create(req.body);
    res.status(201).json({ success: true, data: guide });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update guide
export const updateGuide = async (req: Request, res: Response) => {
  try {
    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    res.status(200).json({ success: true, data: guide });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete guide
export const deleteGuide = async (req: Request, res: Response) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Guide deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
