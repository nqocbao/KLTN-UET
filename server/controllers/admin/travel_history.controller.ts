import type { Request, Response } from "express";
import TravelHistory from "../../models/travel_history.model.js";

// Get all travel history
export const getAllTravelHistory = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const filter = user_id ? { user_id } : {};

    const travelHistory = await TravelHistory.find(filter)
      .populate("user_id")
      .populate("hotel_id")
      .populate("restaurant_id")
      .populate("transport_id")
      .populate("airline_id")
      .populate("destination_id")
      .populate("tour_id")
      .sort({ visited_at: -1 });

    res.status(200).json({ success: true, data: travelHistory });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get travel history by ID
export const getTravelHistoryById = async (req: Request, res: Response) => {
  try {
    const travelHistory = await TravelHistory.findById(req.params.id)
      .populate("user_id")
      .populate("hotel_id")
      .populate("restaurant_id")
      .populate("transport_id")
      .populate("airline_id")
      .populate("destination_id")
      .populate("tour_id");

    if (!travelHistory) {
      return res.status(404).json({
        success: false,
        message: "Travel history not found",
      });
    }

    res.status(200).json({ success: true, data: travelHistory });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create travel history
export const createTravelHistory = async (req: Request, res: Response) => {
  try {
    const travelHistory = await TravelHistory.create(req.body);
    res.status(201).json({ success: true, data: travelHistory });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete travel history
export const deleteTravelHistory = async (req: Request, res: Response) => {
  try {
    const travelHistory = await TravelHistory.findByIdAndDelete(req.params.id);

    if (!travelHistory) {
      return res.status(404).json({
        success: false,
        message: "Travel history not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Travel history deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
