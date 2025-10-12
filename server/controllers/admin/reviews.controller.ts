import { Request, Response } from "express";
import Review from "../../models/reviews.model.js";

// Get all reviews
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { target_type, target_id, user_id } = req.query;
    const filter: any = {};

    if (target_type) filter.target_type = target_type;
    if (target_id) filter.target_id = target_id;
    if (user_id) filter.user_id = user_id;

    const reviews = await Review.find(filter)
      .populate("user_id")
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id).populate("user_id");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create review
export const createReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
