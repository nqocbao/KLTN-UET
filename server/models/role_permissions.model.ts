import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema({
  role_id: { type: Number, required: true, ref: "Role" },
  permission_id: { type: Number, required: true, ref: "Permission" },
});

// Tạo compound index để đảm bảo unique
rolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });

const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);

export default RolePermission;
