import { Request, Response } from "express";
import Destination from "../../models/destinations.model.js";

// Get all destinations
export const getAllDestinations = async (req: Request, res: Response) => {
  try {
    const { category, country_id } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (country_id) filter.country_id = country_id;

    const destinations = await Destination.find(filter)
      .populate("country_id")
      .populate("address_id");

    res.status(200).json({ success: true, data: destinations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get destination by ID
export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate("country_id")
      .populate("address_id");

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({ success: true, data: destination });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create destination
export const createDestination = async (req: Request, res: Response) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, data: destination });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update destination
export const updateDestination = async (req: Request, res: Response) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({ success: true, data: destination });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete destination
export const deleteDestination = async (req: Request, res: Response) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
