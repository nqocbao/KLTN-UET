import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    images: { type: mongoose.Schema.Types.Mixed }, // JSON
    address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
