import mongoose from "mongoose";

const tourDestinationSchema = new mongoose.Schema({
  tour_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
    required: true,
  },
  destination_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
    required: true,
  },
  order_index: { type: Number }, // Thứ tự ghé thăm
  stay_duration_hours: { type: Number },
  note: { type: String },
});

const TourDestination = mongoose.model(
  "TourDestination",
  tourDestinationSchema
);

export default TourDestination;
