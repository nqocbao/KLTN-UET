import mongoose from "mongoose";
import dotenv from "dotenv";
import Tour from "../models/tours.model.js";
import Province from "../models/provinces.model.js";
import Destination from "../models/destinations.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/travel_booking";

async function updateTourProvinces() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to database");

    // Get provinces
    const haNoi = await Province.findOne({ name: { $regex: "Hà Nội", $options: "i" } });
    const hoChiMinh = await Province.findOne({ name: { $regex: "Hồ Chí Minh", $options: "i" } });
    const daNang = await Province.findOne({ name: { $regex: "Đà Nẵng", $options: "i" } });

    if (!haNoi || !hoChiMinh || !daNang) {
      console.error("❌ Cannot find required provinces");
      process.exit(1);
    }

    console.log("📍 Found provinces:", { haNoi: haNoi._id, hoChiMinh: hoChiMinh._id, daNang: daNang._id });

    // Get destination IDs that were used as departure locations
    const departureDestinations = await Destination.find({
      name: { $in: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"] }
    });

    console.log("🗺️ Found departure destinations:", departureDestinations.map(d => ({ name: d.name, id: d._id })));

    // Update tours based on old destination references
    let updated = 0;

    for (const dest of departureDestinations) {
      let provinceId;
      if (dest.name.includes("Hà Nội")) provinceId = haNoi._id;
      else if (dest.name.includes("Hồ Chí Minh")) provinceId = hoChiMinh._id;
      else if (dest.name.includes("Đà Nẵng")) provinceId = daNang._id;

      if (provinceId) {
        const result = await Tour.updateMany(
          { departure_location_id: dest._id },
          { $set: { departure_location_id: provinceId } }
        );
        console.log(`✅ Updated ${result.modifiedCount} tours from ${dest.name} to province`);
        updated += result.modifiedCount;
      }
    }

    console.log(`\n🎉 Total updated: ${updated} tours`);

    // Verify
    const toursWithProvince = await Tour.find({ departure_location_id: { $exists: true } })
      .populate('departure_location_id')
      .limit(5);
    
    console.log("\n📋 Sample tours:");
    toursWithProvince.forEach(tour => {
      console.log(`  - ${tour.name}: ${(tour.departure_location_id as any)?.name || 'N/A'}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateTourProvinces();
