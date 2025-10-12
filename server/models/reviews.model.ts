import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    target_type: {
      type: String,
      enum: [
        "destination",
        "hotel",
        "restaurant",
        "transport",
        "airline",
        "guide",
      ],
    },
    target_id: { type: mongoose.Schema.Types.ObjectId },
    rating: { type: Number, min: 0, max: 5 },
    comment: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
