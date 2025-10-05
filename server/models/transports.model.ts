import mongoose from "mongoose";

const transportSchema = new mongoose.Schema({
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  type: {
    type: String,
    enum: ["bus", "train", "car", "other"],
  },
  description: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  logo_url: { type: String },
  banner_url: { type: String },
});

const Transport = mongoose.model("Transport", transportSchema);

export default Transport;
