import mongoose from "mongoose";

const wardSchema = new mongoose.Schema({
  district_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "District",
  },
  name: { type: String, trim: true },
});

const Ward = mongoose.model("Ward", wardSchema);

export default Ward;
