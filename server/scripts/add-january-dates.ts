import mongoose from "mongoose";
import dotenv from "dotenv";
import Tour from "../models/tours.model.js";

dotenv.config();

const addJanuaryDates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/travel-booking");
    console.log("✅ Connected to database");

    // Thêm ngày tháng 1 cho các tour
    const januaryDates = [
      new Date('2026-01-03'),
      new Date('2026-01-05'),
      new Date('2026-01-08'),
      new Date('2026-01-10'),
      new Date('2026-01-12'),
      new Date('2026-01-15'),
      new Date('2026-01-18'),
      new Date('2026-01-22'),
      new Date('2026-01-25'),
    ];

    const result = await Tour.updateMany(
      {},
      { $push: { departure_dates: { $each: januaryDates } } }
    );

    console.log(`✅ Updated ${result.modifiedCount} tours with January departure dates`);

    await mongoose.disconnect();
    console.log("✅ Disconnected from database");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

addJanuaryDates();
