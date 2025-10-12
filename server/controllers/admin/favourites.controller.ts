import { Request, Response } from "express";
import Favourite from "../../models/favourites.model.js";

// Get all favourites
export const getAllFavourites = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const filter = user_id ? { user_id } : {};

    const favourites = await Favourite.find(filter)
      .populate("user_id")
      .populate("hotel_id")
      .populate("restaurant_id")
      .populate("transport_id")
      .populate("airline_id")
      .populate("destination_id")
      .populate("tour_id");

    res.status(200).json({ success: true, data: favourites });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get favourite by ID
export const getFavouriteById = async (req: Request, res: Response) => {
  try {
    const favourite = await Favourite.findById(req.params.id)
      .populate("user_id")
      .populate("hotel_id")
      .populate("restaurant_id")
      .populate("transport_id")
      .populate("airline_id")
      .populate("destination_id")
      .populate("tour_id");

    if (!favourite) {
      return res.status(404).json({
        success: false,
        message: "Favourite not found",
      });
    }

    res.status(200).json({ success: true, data: favourite });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create favourite
export const createFavourite = async (req: Request, res: Response) => {
  try {
    const favourite = await Favourite.create(req.body);
    res.status(201).json({ success: true, data: favourite });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete favourite
export const deleteFavourite = async (req: Request, res: Response) => {
  try {
    const favourite = await Favourite.findByIdAndDelete(req.params.id);

    if (!favourite) {
      return res.status(404).json({
        success: false,
        message: "Favourite not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Favourite deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
