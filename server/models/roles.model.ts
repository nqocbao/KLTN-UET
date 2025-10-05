import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  description: { type: String },
});

const Role = mongoose.model("Role", roleSchema);

export default Role;
