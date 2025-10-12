import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "bot"],
    },
    content: { type: String },
    intent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Intent" },
    entity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Entity" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
