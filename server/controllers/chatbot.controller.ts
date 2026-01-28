import type { Request, Response } from "express";
import axios from "axios";
import Conversation from "../models/conversations.model.js";
import Message from "../models/messages.model.js";

/**
 * RASA CHATBOT CONTROLLER
 * Full integration with RASA NLU/Core servers
 */

// RASA Configuration
const RASA_SERVER_URL = process.env.RASA_SERVER_URL || "http://localhost:5005";
const RASA_WEBHOOK_URL = `${RASA_SERVER_URL}/webhooks/rest/webhook`;

/**
 * Create new conversation
 */
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    
    const conversation = new Conversation({
      user_id: user_id || null,
      started_at: new Date(),
    });
    
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

/**
 * Get all conversations
 */
export const getConversations = async (_req: Request, res: Response) => {
  try {
    const allConversations = await Conversation.find()
      .populate("user_id")
      .sort({ started_at: -1 })
      .limit(100);
    res.json(allConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

/**
 * Get conversation by ID with messages
 */
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findById(id).populate("user_id");
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    const messages = await Message.find({ conversation_id: id })
      .sort({ created_at: 1 });
    
    res.json({ ...conversation.toJSON(), messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

/**
 * End conversation
 */
export const endConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { ended_at: new Date() },
      { new: true }
    );
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
   
    res.json(conversation);
  } catch (error) {
    console.error("Error ending conversation:", error);
    res.status(500).json({ error: "Failed to end conversation" });
  }
};

/**
 * Send message to RASA Chatbot
 * Full RASA integration with NLU/Core
 */
export const sendMessageToRasa = async (req: Request, res: Response) => {
  try {
    const { message, sender, conversation_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Generate unique sender ID if not provided
    const senderId = sender || `user_${Date.now()}`;

    // Save user message to database if conversation_id provided
    if (conversation_id) {
      const userMessage = new Message({
        conversation_id,
        sender: "user",
        content: message,
      });
      await userMessage.save();
    }

    // Call RASA webhook
    const rasaResponse = await axios.post(
      RASA_WEBHOOK_URL,
      {
        sender: senderId,
        message: message,
      },
      {
        timeout: 10000, // 10 seconds timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const botResponses = rasaResponse.data;

    // Save bot responses to database if conversation_id provided
    if (conversation_id && Array.isArray(botResponses)) {
      for (const response of botResponses) {
        const botMessage = new Message({
          conversation_id,
          sender: "bot",
          content: response.text || response.custom?.text || "",
        });
        await botMessage.save();
      }
    }

    // Return RASA responses to frontend
    res.json(botResponses);
  } catch (error: any) {
    console.error("Error communicating with RASA:", error.message);
    
    // Check if RASA server is down
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        error: "RASA server is not available. Please make sure RASA is running.",
        details: "Run: cd chatbot && rasa run --enable-api --cors '*'",
      });
    }

    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
};
