import { Request, Response } from "express";
import Intent from "../../models/intents.model.js";

// Get all intents
export const getAllIntents = async (req: Request, res: Response) => {
  try {
    const intents = await Intent.find();
    res.status(200).json({ success: true, data: intents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get intent by ID
export const getIntentById = async (req: Request, res: Response) => {
  try {
    const intent = await Intent.findById(req.params.id);

    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Intent not found",
      });
    }

    res.status(200).json({ success: true, data: intent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create intent
export const createIntent = async (req: Request, res: Response) => {
  try {
    const intent = await Intent.create(req.body);
    res.status(201).json({ success: true, data: intent });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update intent
export const updateIntent = async (req: Request, res: Response) => {
  try {
    const intent = await Intent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Intent not found",
      });
    }

    res.status(200).json({ success: true, data: intent });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete intent
export const deleteIntent = async (req: Request, res: Response) => {
  try {
    const intent = await Intent.findByIdAndDelete(req.params.id);

    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Intent not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Intent deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
