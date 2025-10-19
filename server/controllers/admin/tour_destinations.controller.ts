import type { Request, Response } from "express";
import TourDestination from "../../models/tour_destinations.model.js";

// Get all tour destinations
export const getAllTourDestinations = async (req: Request, res: Response) => {
  try {
    const { tour_id } = req.query;
    const filter = tour_id ? { tour_id } : {};

    const tourDestinations = await TourDestination.find(filter)
      .populate("tour_id")
      .populate("destination_id")
      .sort({ order_index: 1 });

    res.status(200).json({ success: true, data: tourDestinations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tour destination by ID
export const getTourDestinationById = async (req: Request, res: Response) => {
  try {
    const tourDestination = await TourDestination.findById(req.params.id)
      .populate("tour_id")
      .populate("destination_id");

    if (!tourDestination) {
      return res.status(404).json({
        success: false,
        message: "Tour destination not found",
      });
    }

    res.status(200).json({ success: true, data: tourDestination });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create tour destination
export const createTourDestination = async (req: Request, res: Response) => {
  try {
    const tourDestination = await TourDestination.create(req.body);
    res.status(201).json({ success: true, data: tourDestination });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update tour destination
export const updateTourDestination = async (req: Request, res: Response) => {
  try {
    const tourDestination = await TourDestination.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tourDestination) {
      return res.status(404).json({
        success: false,
        message: "Tour destination not found",
      });
    }

    res.status(200).json({ success: true, data: tourDestination });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete tour destination
export const deleteTourDestination = async (req: Request, res: Response) => {
  try {
    const tourDestination = await TourDestination.findByIdAndDelete(
      req.params.id
    );

    if (!tourDestination) {
      return res.status(404).json({
        success: false,
        message: "Tour destination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour destination deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
