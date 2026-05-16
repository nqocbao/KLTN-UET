import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodReview from "../models/food_reviews.model.js";
import {
  normalizeFacebookFoodPost,
  type FacebookFoodPost,
  type NormalizedFoodReviewInput,
} from "../utils/food-review-normalizer.js";

dotenv.config();

type ImportableFoodReview = NormalizedFoodReviewInput & {
  postType?: string | null;
  cleaning?: Record<string, unknown>;
  commentFetchPlan?: Record<string, unknown>;
  commentSentiment?: Record<string, unknown>;
  comments?: unknown[];
  validComments?: unknown[];
};

function resolveInputPath(): string {
  const cliPath = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (cliPath) {
    return path.resolve(cliPath);
  }

  return path.resolve(process.cwd(), "../.vscode/json/foodtour_HaNoi_Data.json");
}

function isDryRun(): boolean {
  return process.argv.includes("--dry-run");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function extractRecords(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (isRecord(parsed) && Array.isArray(parsed.records)) {
    return parsed.records;
  }

  return [];
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableString(value: unknown): string | null {
  const text = toStringValue(value);
  return text.length > 0 ? text : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function toNonNegativeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function toDateOrNull(value: unknown): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function extractCleaningPostType(record: Record<string, unknown>): string | null {
  const postType = toNullableString(record.postType);
  if (postType) {
    return postType;
  }
  const cleaning = isRecord(record.cleaning) ? record.cleaning : null;
  return cleaning ? toNullableString(cleaning.postType) : null;
}

function normalizeCleanRecord(record: Record<string, unknown>): ImportableFoodReview | null {
  const source = isRecord(record.source) ? record.source : null;
  const area = isRecord(record.area) ? record.area : null;
  const engagement = isRecord(record.engagement) ? record.engagement : null;

  const title = toStringValue(record.title);
  const summary = toStringValue(record.summary);
  const content = toStringValue(record.content);
  const postUrl = source ? toStringValue(source.postUrl) : "";
  const city = area ? toStringValue(area.city) : "";

  if (!title || !summary || !content || !postUrl || !city) {
    return null;
  }

  const normalized: ImportableFoodReview = {
    title,
    summary,
    content,
    area: {
      city,
      district: area ? toNullableString(area.district) : null,
      ward: area ? toNullableString(area.ward) : null,
      addressText: area ? toNullableString(area.addressText) : null,
    },
    dishTags: toStringArray(record.dishTags),
    hashtags: toStringArray(record.hashtags),
    contactPhones: toStringArray(record.contactPhones),
    priceMin: toNumberOrNull(record.priceMin),
    priceMax: toNumberOrNull(record.priceMax),
    imageUrls: toStringArray(record.imageUrls),
    postedAt: toDateOrNull(record.postedAt),
    engagement: {
      likesCount: engagement ? toNonNegativeNumber(engagement.likesCount) : 0,
      commentsCount: engagement ? toNonNegativeNumber(engagement.commentsCount) : 0,
      sharesCount: engagement ? toNonNegativeNumber(engagement.sharesCount) : 0,
      reactionsCount: engagement ? toNonNegativeNumber(engagement.reactionsCount) : 0,
      score: engagement ? toNonNegativeNumber(engagement.score) : 0,
    },
    source: {
      platform: "facebook",
      groupTitle: source ? toNullableString(source.groupTitle) : null,
      groupId: source ? toNullableString(source.groupId) : null,
      postUrl,
      postLegacyId: source ? toNullableString(source.postLegacyId) : null,
      rawInputUrl: source ? toNullableString(source.rawInputUrl) : null,
      authorName: source ? toNullableString(source.authorName) : null,
      authorId: source ? toNullableString(source.authorId) : null,
    },
    isActive: typeof record.isActive === "boolean" ? record.isActive : true,
    rawPayload: record.rawPayload ?? record,
  };

  const postType = extractCleaningPostType(record);
  if (postType) {
    normalized.postType = postType;
  }
  if (isRecord(record.cleaning)) {
    normalized.cleaning = record.cleaning;
  }
  if (isRecord(record.commentFetchPlan)) {
    normalized.commentFetchPlan = {
      ...record.commentFetchPlan,
      status: toNullableString(record.commentFetchPlan.status) || "pending",
      fetchedAt: toDateOrNull(record.commentFetchPlan.fetchedAt),
    };
  }
  if (isRecord(record.commentSentiment)) {
    normalized.commentSentiment = {
      ...record.commentSentiment,
      analyzedAt: toDateOrNull(record.commentSentiment.analyzedAt),
    };
  }
  if (Array.isArray(record.comments)) {
    normalized.comments = record.comments;
  }
  if (Array.isArray(record.validComments)) {
    normalized.validComments = record.validComments;
  }

  return normalized;
}

function normalizeImportRecord(item: unknown): ImportableFoodReview | null {
  if (!isRecord(item)) {
    return null;
  }

  if (isRecord(item.source) && typeof item.content === "string" && typeof item.title === "string") {
    return normalizeCleanRecord(item);
  }

  return normalizeFacebookFoodPost(item as FacebookFoodPost);
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
  const records = extractRecords(parsed);
  if (!records.length) {
    throw new Error("Input JSON must be an array of posts or an object with a records array");
  }

  if (isDryRun()) {
    let valid = 0;
    let skipped = 0;
    let withPostType = 0;
    let withCleaning = 0;
    let withCommentFetchPlan = 0;
    let withCommentSentiment = 0;
    let withComments = 0;
    let withValidComments = 0;

    for (const item of records) {
      const normalized = normalizeImportRecord(item);
      if (!normalized) {
        skipped += 1;
        continue;
      }
      valid += 1;
      if (normalized.postType) withPostType += 1;
      if (normalized.cleaning) withCleaning += 1;
      if (normalized.commentFetchPlan) withCommentFetchPlan += 1;
      if (normalized.commentSentiment) withCommentSentiment += 1;
      if (normalized.comments?.length) withComments += 1;
      if (normalized.validComments?.length) withValidComments += 1;
    }

    console.log("=== Food review import dry run ===");
    console.log(`Import source          : ${inputPath}`);
    console.log(`Total records          : ${records.length}`);
    console.log(`Valid normalized       : ${valid}`);
    console.log(`Skipped                : ${skipped}`);
    console.log(`With postType          : ${withPostType}`);
    console.log(`With cleaning          : ${withCleaning}`);
    console.log(`With commentFetchPlan  : ${withCommentFetchPlan}`);
    console.log(`With commentSentiment  : ${withCommentSentiment}`);
    console.log(`With comments          : ${withComments}`);
    console.log(`With validComments     : ${withValidComments}`);
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to database");
  console.log(`📥 Import source: ${inputPath}`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of records) {
    const normalized = normalizeImportRecord(item);
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
