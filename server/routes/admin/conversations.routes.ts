import express from "express";
import {
  getAllConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
} from "../../controllers/admin/conversations.controller.js";

const router = express.Router();

router.get("/", getAllConversations);
router.get("/:id", getConversationById);
router.post("/", createConversation);
router.put("/:id", updateConversation);
router.delete("/:id", deleteConversation);

export default router;
