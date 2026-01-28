import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    country_id: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    guide_id: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
    departure_location_id: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
    adult_price: { type: Number },
    child_price: { type: Number },
    duration_days: { type: Number },
    rating: { type: Number, min: 0, max: 5 },
    departure_dates: [{ type: Date }], // Các ngày khởi hành có sẵn
    included_services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }], // Dịch vụ đi kèm
    images: { type: mongoose.Schema.Types.Mixed }, // JSON
    banner_url: { type: String },
  },
  {
    timestamps: true,
  }
);

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
