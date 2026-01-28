import mongoose from "mongoose";
import dotenv from "dotenv";
import { Transport } from "../models/transports.model.js";

dotenv.config();

async function checkTransports() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Connected to database\n");

    // Check all transports
    const allTransports = await Transport.find({});
    console.log(`📊 Total transports: ${allTransports.length}`);
    
    // Check by type
    const buses = await Transport.find({ type: "bus" });
    console.log(`🚌 Buses: ${buses.length}`);
    
    const transfers = await Transport.find({ type: "airport_transfer" });
    console.log(`✈️  Airport transfers: ${transfers.length}`);
    
    // Show sample data
    if (buses.length > 0) {
      console.log("\n📝 Sample bus:");
      console.log(JSON.stringify(buses[0], null, 2));
    }
    
    if (transfers.length > 0) {
      console.log("\n📝 Sample airport transfer:");
      console.log(JSON.stringify(transfers[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkTransports();
