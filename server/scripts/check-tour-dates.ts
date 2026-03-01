import mongoose from "mongoose";
import dotenv from "dotenv";
import Tour from "../models/tours.model.js";
import Destination from "../models/destinations.model.js";

dotenv.config();

const checkTourDates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/travel-booking");
    console.log("✅ Connected to database");

    const tours = await Tour.find({})
      .populate("departure_location_id")
      .select("name departure_dates departure_location_id")
      .limit(20);

    console.log("\n📅 Tour Departure Dates:\n");
    
    tours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.name}`);
      console.log(`   Departure Location: ${(tour.departure_location_id as any)?.name || 'N/A'}`);
      console.log(`   Departure Dates (${tour.departure_dates?.length || 0} dates):`);
      
      if (tour.departure_dates && tour.departure_dates.length > 0) {
        tour.departure_dates.slice(0, 5).forEach((date, i) => {
          const d = new Date(date);
          console.log(`     ${i + 1}. ${d.toLocaleDateString('vi-VN')} (${d.toISOString()})`);
        });
        if (tour.departure_dates.length > 5) {
          console.log(`     ... and ${tour.departure_dates.length - 5} more dates`);
        }
      } else {
        console.log(`     No departure dates`);
      }
      console.log("");
    });

    await mongoose.disconnect();
    console.log("✅ Disconnected from database");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkTourDates();
