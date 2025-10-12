import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  license_number: { type: String },
  languages: { type: mongoose.Schema.Types.Mixed }, // JSON
  rating: { type: Number, min: 0, max: 5 },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
});

const Guide = mongoose.model("Guide", guideSchema);

export default Guide;
