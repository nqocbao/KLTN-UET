import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  cuisine_type: { type: String, trim: true }, // Loại ẩm thực: việt nam, hàn,...
  rating: { type: Number, min: 0, max: 5 },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  logo_url: { type: String },
  banner_url: { type: String },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
