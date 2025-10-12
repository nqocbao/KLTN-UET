import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
});

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
