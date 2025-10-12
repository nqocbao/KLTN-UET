import { Request, Response } from "express";
import TourReview from "../../models/tour_reviews.model.js";

// Get all tour reviews
export const getAllTourReviews = async (req: Request, res: Response) => {
  try {
    const { tour_id, user_id } = req.query;
    const filter: any = {};

    if (tour_id) filter.tour_id = tour_id;
    if (user_id) filter.user_id = user_id;

    const tourReviews = await TourReview.find(filter)
      .populate("user_id")
      .populate("tour_id")
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, data: tourReviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tour review by ID
export const getTourReviewById = async (req: Request, res: Response) => {
  try {
    const tourReview = await TourReview.findById(req.params.id)
      .populate("user_id")
      .populate("tour_id");

    if (!tourReview) {
      return res.status(404).json({
        success: false,
        message: "Tour review not found",
      });
    }

    res.status(200).json({ success: true, data: tourReview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create tour review
export const createTourReview = async (req: Request, res: Response) => {
  try {
    const tourReview = await TourReview.create(req.body);
    res.status(201).json({ success: true, data: tourReview });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update tour review
export const updateTourReview = async (req: Request, res: Response) => {
  try {
    const tourReview = await TourReview.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tourReview) {
      return res.status(404).json({
        success: false,
        message: "Tour review not found",
      });
    }

    res.status(200).json({ success: true, data: tourReview });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete tour review
export const deleteTourReview = async (req: Request, res: Response) => {
  try {
    const tourReview = await TourReview.findByIdAndDelete(req.params.id);

    if (!tourReview) {
      return res.status(404).json({
        success: false,
        message: "Tour review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour review deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
