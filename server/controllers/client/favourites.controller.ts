import type { Request, Response } from "express";
import mongoose from "mongoose";
import Favourite from "../../models/favourites.model.js";

type FavType =
  | "hotel"
  | "tour"
  | "restaurant"
  | "destination"
  | "transport"
  | "airline";

const TYPE_FIELD: Record<FavType, string> = {
  hotel: "hotel_id",
  tour: "tour_id",
  restaurant: "restaurant_id",
  destination: "destination_id",
  transport: "transport_id",
  airline: "airline_id",
};

const isValidType = (t: unknown): t is FavType =>
  typeof t === "string" && t in TYPE_FIELD;

const isValidObjectId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// GET /client/favourites  -> all favourites of the current user (populated)
export const listMyFavourites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    const items = await Favourite.find({ user_id: userId })
      .populate("hotel_id")
      .populate("restaurant_id")
      .populate("transport_id")
      .populate("airline_id")
      .populate("destination_id")
      .populate("tour_id")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /client/favourites/check?type=hotel&item_id=...
export const checkFavourite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    const { type, item_id } = req.query;
    if (!isValidType(type) || !isValidObjectId(item_id)) {
      return res.status(200).json({ success: true, data: { favourited: false } });
    }

    const field = TYPE_FIELD[type];
    const existing = await Favourite.findOne({
      user_id: userId,
      [field]: item_id,
    }).select("_id");

    res.status(200).json({
      success: true,
      data: { favourited: !!existing, id: existing?._id ?? null },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /client/favourites  body: { type, item_id }
export const addFavourite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    const { type, item_id } = req.body ?? {};
    if (!isValidType(type)) {
      return res.status(400).json({ success: false, message: "type không hợp lệ" });
    }
    if (!isValidObjectId(item_id)) {
      return res.status(400).json({ success: false, message: "item_id không hợp lệ" });
    }

    const field = TYPE_FIELD[type];
    const existing = await Favourite.findOne({
      user_id: userId,
      [field]: item_id,
    });
    if (existing) {
      return res.status(200).json({ success: true, data: existing, duplicated: true });
    }

    const created = await Favourite.create({
      user_id: userId,
      [field]: item_id,
    });
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /client/favourites?type=hotel&item_id=...
export const removeFavourite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    const { type, item_id } = req.query;
    if (!isValidType(type) || !isValidObjectId(item_id)) {
      return res.status(400).json({ success: false, message: "Tham số không hợp lệ" });
    }

    const field = TYPE_FIELD[type];
    const result = await Favourite.findOneAndDelete({
      user_id: userId,
      [field]: item_id,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mục yêu thích" });
    }
    res.status(200).json({ success: true, message: "Đã xóa khỏi yêu thích" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
