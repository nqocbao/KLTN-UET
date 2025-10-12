import { Request, Response } from "express";
import Conversation from "../../models/conversations.model.js";

// Get all conversations
export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const filter = user_id ? { user_id } : {};

    const conversations = await Conversation.find(filter)
      .populate("user_id")
      .sort({ started_at: -1 });

    res.status(200).json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversation by ID
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate(
      "user_id"
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create conversation
export const createConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.create(req.body);
    res.status(201).json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update conversation
export const updateConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete conversation
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
