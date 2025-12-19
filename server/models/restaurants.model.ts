import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image_url: { type: String },
  cuisine: { type: String },
  cuisine_type: { type: String }, // Loại ẩm thực: việt nam, hàn,...
  location: { type: String },
  description: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  priceLevel: { type: Number, min: 1, max: 4 },
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  logo_url: { type: String },
  banner_url: { type: String },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
