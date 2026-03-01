import mongoose from "mongoose";
import dotenv from "dotenv";
import Tour from "../models/tours.model.js";

dotenv.config();

const clearTours = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to database");

        // Xóa toàn bộ dữ liệu tour
        const result = await Tour.deleteMany({});
        console.log(`🗑️  Đã xóa ${result.deletedCount} tours trong database`);

        console.log("✅ Hoàn thành việc xóa dữ liệu tour!");
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi khi xóa dữ liệu:", error);
        process.exit(1);
    }
}

clearTours();
