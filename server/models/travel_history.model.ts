import mongoose from "mongoose";

const travelHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  transport_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transport" },
  airline_id: { type: mongoose.Schema.Types.ObjectId, ref: "Airline" },
  destination_id: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
  visited_at: { type: Date },
});

const TravelHistory = mongoose.model("TravelHistory", travelHistorySchema);

export default TravelHistory;
