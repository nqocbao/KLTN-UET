import mongoose from "mongoose";
import dotenv from "dotenv";
import Tour from "../models/tours.model.js";

dotenv.config();

const testDateFilter = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/travel-booking");
    console.log("✅ Connected to database");

    // Test với khoảng ngày 3/1-10/1
    const fromDate = new Date('2026-01-03T00:00:00.000Z');
    const toDate = new Date('2026-01-10T23:59:59.999Z');

    console.log("\n📅 Testing date filter:");
    console.log(`From: ${fromDate.toISOString()}`);
    console.log(`To: ${toDate.toISOString()}\n`);

    const filter: any = {
      departure_dates: { 
        $elemMatch: { 
          $gte: fromDate,
          $lte: toDate
        } 
      }
    };

    console.log("Filter:", JSON.stringify(filter, null, 2));

    const tours = await Tour.find(filter).select("name departure_dates").limit(10);

    console.log(`\n✅ Found ${tours.length} tours\n`);
    
    if (tours.length > 0) {
      tours.forEach((tour, index) => {
        console.log(`${index + 1}. ${tour.name}`);
        const matchingDates = tour.departure_dates?.filter((d: Date) => {
          const date = new Date(d);
          return date >= fromDate && date <= toDate;
        });
        console.log(`   Matching dates (${matchingDates?.length || 0}):`);
        matchingDates?.forEach((d: Date) => {
          console.log(`     - ${new Date(d).toLocaleDateString('vi-VN')}`);
        });
        console.log("");
      });
    } else {
      console.log("❌ No tours found with departure dates between 3/1/2026 and 10/1/2026");
      console.log("This is expected because all tours have dates from late January onwards (29/1, 30/1, 31/1...)");
    }

    // Now test without filter to see all tours
    console.log("\n\n📊 Testing WITHOUT date filter (should return all tours):");
    const allTours = await Tour.find({}).select("name departure_dates").limit(5);
    console.log(`Found ${allTours.length} tours (showing first 5)\n`);
    
    allTours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.name}`);
      console.log(`   First 3 dates:`);
      tour.departure_dates?.slice(0, 3).forEach((d: Date) => {
        console.log(`     - ${new Date(d).toLocaleDateString('vi-VN')}`);
      });
      console.log("");
    });

    await mongoose.disconnect();
    console.log("✅ Disconnected from database");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testDateFilter();
