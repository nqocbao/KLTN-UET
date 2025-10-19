import type { Request, Response } from "express";
import TourTransport from "../../models/tour_transports.model.js";

// Get all tour transports
export const getAllTourTransports = async (req: Request, res: Response) => {
  try {
    const { tour_id } = req.query;
    const filter = tour_id ? { tour_id } : {};

    const tourTransports = await TourTransport.find(filter)
      .populate("tour_id")
      .populate("transport_id")
      .populate("from_destination_id")
      .populate("to_destination_id")
      .sort({ order_index: 1 });

    res.status(200).json({ success: true, data: tourTransports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tour transport by ID
export const getTourTransportById = async (req: Request, res: Response) => {
  try {
    const tourTransport = await TourTransport.findById(req.params.id)
      .populate("tour_id")
      .populate("transport_id")
      .populate("from_destination_id")
      .populate("to_destination_id");

    if (!tourTransport) {
      return res.status(404).json({
        success: false,
        message: "Tour transport not found",
      });
    }

    res.status(200).json({ success: true, data: tourTransport });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create tour transport
export const createTourTransport = async (req: Request, res: Response) => {
  try {
    const tourTransport = await TourTransport.create(req.body);
    res.status(201).json({ success: true, data: tourTransport });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update tour transport
export const updateTourTransport = async (req: Request, res: Response) => {
  try {
    const tourTransport = await TourTransport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tourTransport) {
      return res.status(404).json({
        success: false,
        message: "Tour transport not found",
      });
    }

    res.status(200).json({ success: true, data: tourTransport });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete tour transport
export const deleteTourTransport = async (req: Request, res: Response) => {
  try {
    const tourTransport = await TourTransport.findByIdAndDelete(req.params.id);

    if (!tourTransport) {
      return res.status(404).json({
        success: false,
        message: "Tour transport not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour transport deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
