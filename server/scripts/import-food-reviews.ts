import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodReview from "../models/food_reviews.model.js";
import {
  normalizeFacebookFoodPost,
  type FacebookFoodPost,
} from "../utils/food-review-normalizer.js";

dotenv.config();

function resolveInputPath(): string {
  const cliPath = process.argv[2];
  if (cliPath) {
    return path.resolve(cliPath);
  }

  return path.resolve(process.cwd(), "../.vscode/json/foodtour_HaNoi_Data.json");
}

async function runImport() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  const inputPath = resolveInputPath();
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const rawText = fs.readFileSync(inputPath, "utf-8");
  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed)) {
    throw new Error("Input JSON must be an array of posts");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to database");
  console.log(`📥 Import source: ${inputPath}`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of parsed as FacebookFoodPost[]) {
    const normalized = normalizeFacebookFoodPost(item);
    if (!normalized) {
      skipped += 1;
      continue;
    }

    const filter = normalized.source.postLegacyId
      ? { "source.postLegacyId": normalized.source.postLegacyId }
      : { "source.postUrl": normalized.source.postUrl };

    const exists = await FoodReview.exists(filter);

    await FoodReview.updateOne(
      filter,
      {
        $set: normalized,
      },
      { upsert: true }
    );

    if (exists) {
      updated += 1;
    } else {
      inserted += 1;
    }
  }

  console.log("\n✅ Food review import completed");
  console.log(`   - Inserted: ${inserted}`);
  console.log(`   - Updated : ${updated}`);
  console.log(`   - Skipped : ${skipped}`);

  await mongoose.disconnect();
}

runImport()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("❌ Import failed:", error.message || error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  });
