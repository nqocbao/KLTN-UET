import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Province",
    required: true,
  },
  name: { type: String },
});

const District = mongoose.model("District", districtSchema);

export default District;
