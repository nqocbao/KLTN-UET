import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    transport_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transport" },
    airline_id: { type: mongoose.Schema.Types.ObjectId, ref: "Airline" },
    destination_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
    },
  },
  {
    timestamps: true,
  }
);

const Favourite = mongoose.model("Favourite", favouriteSchema);

export default Favourite;
