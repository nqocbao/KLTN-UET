import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: {
      type: String,
      enum: ["hotel", "restaurant", "transport", "airline", "other"],
    },
    description: { type: String },
    images: { type: mongoose.Schema.Types.Mixed }, // JSON
    logo_url: { type: String },
    banner_url: { type: String },
    country_id: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  },
  {
    timestamps: true,
  }
);

const Partner = mongoose.model("Partner", partnerSchema);

export default Partner;
