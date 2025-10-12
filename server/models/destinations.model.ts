import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  category: {
    type: String,
    enum: ["museum", "park", "historic", "beach", "mountain", "other"],
  },
  country_id: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  rating: { type: Number, min: 0, max: 5 },
  images: { type: mongoose.Schema.Types.Mixed }, // JSON
  logo_url: { type: String },
  banner_url: { type: String },
});

const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;
