import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Conversation",
    },
    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
    content: { type: String },
    intent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Intent" },
    entity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Entity" },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
