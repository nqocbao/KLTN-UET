import mongoose from "mongoose";

const wardSchema = new mongoose.Schema({
  district_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
  name: { type: String },
});

const Ward = mongoose.model("Ward", wardSchema);

export default Ward;
