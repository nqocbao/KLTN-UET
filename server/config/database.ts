import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "";
    if (!mongoUri) {
      console.log("❌ MONGO_URI is missing in .env file");
      return;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
    console.log("✅ Kết nối database thành công");
  } catch (error) {
    console.error("❌ Kết nối database thất bại:", error);
    // Không exit process để server vẫn chạy (cho chatbot test)
  }
};
