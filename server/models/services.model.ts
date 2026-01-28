import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["meal", "transport", "entertainment", "amenity", "insurance", "other"],
      required: true,
    },
    icon: { type: String }, // Icon name hoặc emoji
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
