import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema({
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  permission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission",
    required: true,
  },
});

const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);

export default RolePermission;
