import type { Request, Response } from "express";
import Restaurant from "../../models/restaurants.model.js";

// Get all restaurants
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const { cuisine_type } = req.query;
    const filter = cuisine_type ? { cuisine_type } : {};

    const restaurants = await Restaurant.find(filter)
      .populate("partner_id")
      .populate("address_id")
      .skip(skip)
      .limit(limit);

    const total = await Restaurant.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: restaurants,
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

// Get restaurant by ID
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate("partner_id")
      .populate("address_id");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create restaurant
export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update restaurant
export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
