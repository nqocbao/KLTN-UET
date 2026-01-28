import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function dropOldCollections() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log("\n📋 Current collections:", collectionNames.join(", "));
    
    // Collections to drop
    const oldCollections = ["buses", "airporttransfers", "airport_transfers"];
    
    for (const collectionName of oldCollections) {
      if (collectionNames.includes(collectionName)) {
        await db.dropCollection(collectionName);
        console.log(`🗑️  Dropped collection: ${collectionName}`);
      } else {
        console.log(`⏭️  Collection not found (skipped): ${collectionName}`);
      }
    }
    
    // Show remaining collections
    const remainingCollections = await db.listCollections().toArray();
    console.log("\n✅ Remaining collections:", remainingCollections.map(c => c.name).join(", "));
    
    console.log("\n✅ Cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

dropOldCollections();
