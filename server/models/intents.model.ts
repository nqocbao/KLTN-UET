import mongoose from "mongoose";

const intentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Intent = mongoose.model("Intent", intentSchema);

export default Intent;
