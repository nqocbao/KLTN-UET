import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema({
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  name: { type: String },
});

const Province = mongoose.model("Province", provinceSchema);

export default Province;
