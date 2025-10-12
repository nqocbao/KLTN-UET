import mongoose from "mongoose";

const tourTransportSchema = new mongoose.Schema({
  tour_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
    required: true,
  },
  transport_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
    required: true,
  },
  from_destination_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  to_destination_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  order_index: { type: Number },
  note: { type: String },
});

const TourTransport = mongoose.model("TourTransport", tourTransportSchema);

export default TourTransport;
