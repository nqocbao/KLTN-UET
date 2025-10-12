import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String },
    images: { type: mongoose.Schema.Types.Mixed }, // JSON
    address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
