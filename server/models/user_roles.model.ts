import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  role_id: { type: Number, required: true, ref: "Role" },
});

// Tạo compound index để đảm bảo unique
userRoleSchema.index({ user_id: 1, role_id: 1 }, { unique: true });

const UserRole = mongoose.model("UserRole", userRoleSchema);

export default UserRole;
