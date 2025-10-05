import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  rating: { type: Number, min: 0, max: 5 },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  logo_url: { type: String },
  banner_url: { type: String },
});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
