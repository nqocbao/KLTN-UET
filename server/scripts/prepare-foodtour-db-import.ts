import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import FoodReview from "../models/food_reviews.model.js";

dotenv.config();

interface CleanPayload {
  records?: Array<Record<string, unknown>>;
}

const DEFAULT_CLEAN_PATH = path.resolve(
  process.cwd(),
  "..",
  "chatbot",
  "rag",
  "outputs",
  "foodtour_cleaning",
  "foodtour_clean_posts_pending_review.json"
);

const DEFAULT_OUTPUT_DIR = path.resolve(
  process.cwd(),
  "..",
  "chatbot",
  "rag",
  "outputs",
  "foodtour_cleaning"
);

function readJson(pathname: string): CleanPayload {
  return JSON.parse(fs.readFileSync(pathname, "utf-8")) as CleanPayload;
}

function writeJson(pathname: string, payload: unknown) {
  fs.mkdirSync(path.dirname(pathname), { recursive: true });
  fs.writeFileSync(pathname, JSON.stringify(payload, null, 2), "utf-8");
}

function getNestedString(record: Record<string, unknown>, keys: string[]): string {
  let current: unknown = record;
  for (const key of keys) {
    if (!current || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current.trim() : "";
}

function getImportKey(record: Record<string, unknown>): string | null {
  const legacyId = getNestedString(record, ["source", "postLegacyId"]);
  if (legacyId) return `legacy:${legacyId}`;

  const postUrl = getNestedString(record, ["source", "postUrl"]).replace(/\?.*$/, "").replace(/\/$/, "");
  if (postUrl) return `url:${postUrl}`;

  return null;
}

function getRawPayload(record: Record<string, unknown>): Record<string, unknown> | null {
  const rawPayload = record.rawPayload;
  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    return null;
  }
  return rawPayload as Record<string, unknown>;
}

async function main() {
  const cleanPath = path.resolve(process.argv[2] || DEFAULT_CLEAN_PATH);
  const outputDir = path.resolve(process.argv[3] || DEFAULT_OUTPUT_DIR);

  const payload = readJson(cleanPath);
  const records = Array.isArray(payload.records) ? payload.records : [];

  const rawPayloads: Record<string, unknown>[] = [];
  const missingRawRows: Array<{ row: number; title: string; postUrl: string }> = [];
  const cleanKeys = new Set<string>();
  const cleanKeyRows: Array<{ row: number; key: string; title: string; postUrl: string; postType: string }> = [];

  records.forEach((record, index) => {
    const raw = getRawPayload(record);
    const postUrl = getNestedString(record, ["source", "postUrl"]);
    const title = typeof record.title === "string" ? record.title : "";
    const postType = getNestedString(record, ["cleaning", "postType"]);

    if (!raw) {
      missingRawRows.push({ row: index + 1, title, postUrl });
    } else {
      rawPayloads.push(raw);
    }

    const key = getImportKey(record);
    if (key) {
      cleanKeys.add(key);
      cleanKeyRows.push({ row: index + 1, key, title, postUrl, postType });
    }
  });

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(uri);
  const existingDocs = await FoodReview.find({})
    .select("source.postLegacyId source.postUrl title")
    .lean();
  await mongoose.disconnect();

  const existingKeys = new Set<string>();
  for (const doc of existingDocs) {
    const source = doc.source || {};
    const legacyId = source.postLegacyId?.trim();
    if (legacyId) {
      existingKeys.add(`legacy:${legacyId}`);
      continue;
    }

    const postUrl = source.postUrl?.trim().replace(/\?.*$/, "").replace(/\/$/, "");
    if (postUrl) {
      existingKeys.add(`url:${postUrl}`);
    }
  }

  const wouldInsert = cleanKeyRows.filter((row) => !existingKeys.has(row.key));
  const wouldUpdate = cleanKeyRows.filter((row) => existingKeys.has(row.key));

  const importReadyPath = path.join(outputDir, "foodtour_db_import_ready_full_records.json");
  const rawPayloadPath = path.join(outputDir, "foodtour_db_import_ready_raw_payloads.json");
  const deltaPath = path.join(outputDir, "foodtour_db_import_delta_summary.json");

  writeJson(importReadyPath, {
    schemaVersion: "foodtour_db_import_ready_full_records_v1",
    createdAt: new Date().toISOString(),
    sourceCleanPath: cleanPath,
    records,
  });
  writeJson(rawPayloadPath, rawPayloads);
  writeJson(deltaPath, {
    schemaVersion: "foodtour_db_import_delta_summary_v1",
    createdAt: new Date().toISOString(),
    cleanPath,
    importReadyPath,
    rawPayloadPath,
    cleanRecords: records.length,
    rawPayloadRecords: rawPayloads.length,
    missingRawPayloadRecords: missingRawRows.length,
    currentDbFoodReviewCount: existingDocs.length,
    cleanUniqueImportKeys: cleanKeys.size,
    wouldInsertCount: wouldInsert.length,
    wouldUpdateCount: wouldUpdate.length,
    missingRawRows: missingRawRows.slice(0, 100),
    wouldInsertPreview: wouldInsert.slice(0, 50),
    wouldUpdatePreview: wouldUpdate.slice(0, 50),
    note:
      "Read-only DB comparison. Import has not been executed. Use the full-record import file to preserve postType, cleaning, and commentFetchPlan metadata. The raw-payload file is kept only as a fallback.",
  });

  console.log("=== Foodtour DB import preparation complete ===");
  console.log(`Clean records        : ${records.length}`);
  console.log(`Raw payload records  : ${rawPayloads.length}`);
  console.log(`Current DB records   : ${existingDocs.length}`);
  console.log(`Would insert         : ${wouldInsert.length}`);
  console.log(`Would update         : ${wouldUpdate.length}`);
  console.log(`Import-ready file    : ${importReadyPath}`);
  console.log(`Delta summary        : ${deltaPath}`);
}

main().catch(async (error) => {
  console.error(error.message || error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
