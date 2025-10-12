import mongoose from "mongoose";

const tourReviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    rating: { type: Number, min: 0, max: 5 },
    comment: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

const TourReview = mongoose.model("TourReview", tourReviewSchema);

export default TourReview;
