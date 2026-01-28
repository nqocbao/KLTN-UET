import express from "express";
import {
  createConversation,
  getConversations,
  getConversationById,
  endConversation,
  sendMessageToRasa,
} from "../controllers/chatbot.controller.js";

const router = express.Router();

/**
 * @route   POST /api/chatbot/conversations
 * @desc    Create new conversation
 * @access  Public
 */
router.post("/conversations", createConversation);

/**
 * @route   GET /api/chatbot/conversations
 * @desc    Get all conversations
 * @access  Public (should be protected in production)
 */
router.get("/conversations", getConversations);

/**
 * @route   GET /api/chatbot/conversations/:id
 * @desc    Get conversation by ID with messages
 * @access  Public
 */
router.get("/conversations/:id", getConversationById);

/**
 * @route   PUT /api/chatbot/conversations/:id/end
 * @desc    End conversation
 * @access  Public
 */
router.put("/conversations/:id/end", endConversation);

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to RASA chatbot
 * @access  Public
 */
router.post("/message", sendMessageToRasa);

export default router;
