import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  license_number: { type: String, trim: true },
  languages: { type: mongoose.Schema.Types.Mixed }, // JSON array
  rating: { type: Number, min: 0, max: 5 },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
});

const Guide = mongoose.model("Guide", guideSchema);

export default Guide;
