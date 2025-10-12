import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  started_at: { type: Date },
  ended_at: { type: Date },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
