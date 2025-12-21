import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image_url: { type: String },
  location: { type: String },
  description: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  rooms: { type: Number },
  availableRooms: { type: Number, default: 0 },
  priceRange: { type: String },
  priceTwoSingleBed: { type: Number },
  priceOneSingleOneDoubleBed: { type: Number },
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  logo_url: { type: String },
  banner_url: { type: String },
});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
