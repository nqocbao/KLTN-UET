import { Request, Response } from "express";
import Message from "../../models/messages.model.js";

// Get all messages
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const { conversation_id } = req.query;
    const filter = conversation_id ? { conversation_id } : {};

    const messages = await Message.find(filter)
      .populate("conversation_id")
      .populate("intent_id")
      .populate("entity_id")
      .sort({ created_at: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get message by ID
export const getMessageById = async (req: Request, res: Response) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("conversation_id")
      .populate("intent_id")
      .populate("entity_id");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create message
export const createMessage = async (req: Request, res: Response) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
