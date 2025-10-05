import mongoose from "mongoose";

const entitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  value: { type: String, trim: true },
  extra: { type: mongoose.Schema.Types.Mixed }, // JSON
});

const Entity = mongoose.model("Entity", entitySchema);

export default Entity;
