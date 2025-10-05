import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("✅ Kết nối database thành công");
  } catch (error) {
    // console.log(error)
    console.log("❌ Kết nối database thất bại");
  }
};
