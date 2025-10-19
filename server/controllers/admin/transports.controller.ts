import type { Request, Response } from "express";
import Transport from "../../models/transports.model.js";

// Get all transports
export const getAllTransports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const { type } = req.query;
    const filter = type ? { type } : {};

    const transports = await Transport.find(filter)
      .populate("partner_id")
      .populate("address_id")
      .skip(skip)
      .limit(limit);

    const total = await Transport.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: transports,
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

// Get transport by ID
export const getTransportById = async (req: Request, res: Response) => {
  try {
    const transport = await Transport.findById(req.params.id)
      .populate("partner_id")
      .populate("address_id");

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: "Transport not found",
      });
    }

    res.status(200).json({ success: true, data: transport });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create transport
export const createTransport = async (req: Request, res: Response) => {
  try {
    const transport = await Transport.create(req.body);
    res.status(201).json({ success: true, data: transport });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update transport
export const updateTransport = async (req: Request, res: Response) => {
  try {
    const transport = await Transport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: "Transport not found",
      });
    }

    res.status(200).json({ success: true, data: transport });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete transport
export const deleteTransport = async (req: Request, res: Response) => {
  try {
    const transport = await Transport.findByIdAndDelete(req.params.id);

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: "Transport not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transport deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
