import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Province",
  },
  name: { type: String, trim: true },
});

const District = mongoose.model("District", districtSchema);

export default District;
