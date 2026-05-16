import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  normalizeFacebookFoodPost,
  type FacebookFoodPost,
  type NormalizedFoodReviewInput,
} from "../utils/food-review-normalizer.js";

type RawPost = FacebookFoodPost & Record<string, unknown>;

type PostType =
  | "food_review"
  | "food_recommendation"
  | "food_complaint"
  | "food_warning"
  | "food_promotion"
  | "food_question"
  | "event_or_travel"
  | "job_or_spam"
  | "non_food";

type KeepDecision = "keep" | "reject";

interface ClassifiedPost {
  normalized: NormalizedFoodReviewInput;
  raw: RawPost;
  sourceFile: string;
  rowNumber: number;
  dedupeKey: string;
  contentHash: string;
  postType: PostType;
  decision: KeepDecision;
  reasons: string[];
  signals: {
    foodSignalCount: number;
    dishTagCount: number;
    hasAddress: boolean;
    hasPrice: boolean;
    commentsCount: number;
    engagementScore: number;
    isStrongOpinion: boolean;
  };
}

const DEFAULT_INPUT_DIR = "C:\\Users\\Admin\\Downloads\\foodtour";
const DEFAULT_OUTPUT_DIR = path.resolve(
  process.cwd(),
  "..",
  "chatbot",
  "rag",
  "outputs",
  "foodtour_cleaning"
);

const MIN_CONTENT_CHARS = 80;

const FOOD_KEYWORDS = [
  "an uong",
  "do an",
  "mon",
  "quan",
  "nha hang",
  "bep",
  "menu",
  "foodtour",
  "review",
  "ship",
  "shopeefood",
  "grabfood",
  "xanh sm",
  "buffet",
  "com",
  "pho",
  "bun",
  "banh",
  "xoi",
  "chao",
  "mi",
  "my",
  "lau",
  "nuong",
  "oc",
  "nem",
  "cha",
  "vit",
  "ga",
  "bo",
  "heo",
  "thit",
  "hai san",
  "ca phe",
  "cafe",
  "tra sua",
  "che",
  "kem",
  "pizza",
  "burger",
  "sushi",
  "dim sum",
  "dimsum",
  "bbq",
];

const QUESTION_PATTERNS = [
  "cho em hoi",
  "cho e hoi",
  "moi nguoi cho hoi",
  "xin quan",
  "xin dia chi",
  "tim quan",
  "tim dia chi",
  "o dau ban",
  "cho nao ban",
  "ai biet",
  "co ai biet",
  "goi y giup",
  "nen an gi",
];

const JOB_OR_SPAM_PATTERNS = [
  "tuyen dung",
  "tuyen nhan vien",
  "viec lam",
  "xin viec",
  "ung tuyen",
  "part time",
  "full time",
  "luong",
  "ctv",
  "cong tac vien",
  "ban dat",
  "nha dat",
  "chinh chu ban",
  "cho thue mat bang",
  "nha khoa",
  "phu ta",
  "lam toc",
  "nail",
  "spa",
  "tham my",
  "mat xe",
  "mat trom",
  "nhat duoc",
  "tim chu",
  "chuyen khoan nham",
  "lua dao",
  "tai nan",
  "ung ho",
  "quyen gop",
  "limousine",
  "don tra",
  "xe may",
  "o to",
  "mu bao hiem",
];

const EVENT_OR_TRAVEL_PATTERNS = [
  "khach san",
  "homestay",
  "can ho",
  "luu tru",
  "du lich",
  "tour du lich",
  "di tour",
  "ve may bay",
  "du thuyen",
  "su kien",
  "countdown",
  "concert",
  "rap xiec",
  "dia diem gui xe",
  "dieu binh",
  "dien hanh",
  "khu vui choi",
  "trai nghiem dia hinh",
];

const HARD_EVENT_OR_TRAVEL_PATTERNS = [
  "khach san",
  "homestay",
  "can ho",
  "luu tru",
  "du lich",
  "du thuyen",
  "concert",
  "rap xiec",
  "dia diem gui xe",
  "dieu binh",
  "dien hanh",
  "trai nghiem dia hinh",
];

const COMPLAINT_PATTERNS = [
  "buc xuc",
  "that vong",
  "trai nghiem te",
  "qua te",
  "khong bao gio quay lai",
  "khong quay lai",
  "phuc vu te",
  "thai do",
  "chat luong kem",
  "do an te",
  "khong ngon",
  "hoi han",
  "lua",
  "chem",
  "dat cat",
];

const WARNING_PATTERNS = [
  "canh bao",
  "bi moc",
  "moc meo",
  "do thiu",
  "bi thiu",
  "bi san",
  "co san",
  "san trong",
  "oc vit",
  "ngo doc",
  "dau bung",
  "ve sinh",
  "mat ve sinh",
  "do ban",
  "ban thiu",
  "ruoi",
  "toc trong",
  "di vat",
];

const PROMOTION_PATTERNS = [
  "khuyen mai",
  "uu dai",
  "giam gia",
  "sale",
  "combo",
  "voucher",
  "freeship",
  "free ship",
  "dat ban",
  "order",
  "dong gia",
  "khai truong",
  "mua 1 tang 1",
  "%",
];

const RECOMMENDATION_PATTERNS = [
  "top",
  "list",
  "tong hop",
  "foodtour",
  "nen thu",
  "must try",
  "goi ten",
  "lich trinh",
  "dia chi an",
];

const STRONG_OPINION_PATTERNS = [
  ...COMPLAINT_PATTERNS,
  ...WARNING_PATTERNS,
  "ngon nhat",
  "dinh nhat",
  "rat ngon",
  "sieu ngon",
  "dang tien",
  "khong dang",
];

function normalizeForMatch(value: unknown): string {
  const text = typeof value === "string" ? value : "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(normalizedText: string, patterns: string[]): boolean {
  return patterns.some((pattern) => normalizedText.includes(pattern));
}

function startsOrEarlyContains(normalizedText: string, patterns: string[]): boolean {
  const first = normalizedText.slice(0, 220);
  return patterns.some((pattern) => first.startsWith(pattern) || first.includes(` ${pattern} `));
}

function countHits(normalizedText: string, patterns: string[]): number {
  return patterns.reduce((count, pattern) => count + (normalizedText.includes(pattern) ? 1 : 0), 0);
}

function stableHash(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex");
}

function canonicalContentHash(content: string): string {
  return stableHash(normalizeForMatch(content).slice(0, 4000));
}

function getDedupeKey(normalized: NormalizedFoodReviewInput, contentHash: string): string {
  const legacyId = normalized.source.postLegacyId?.trim();
  if (legacyId) {
    return `legacy:${legacyId}`;
  }

  const postUrl = normalized.source.postUrl?.trim().replace(/\?.*$/, "").replace(/\/$/, "");
  if (postUrl) {
    return `url:${postUrl}`;
  }

  return `hash:${contentHash}`;
}

function completenessScore(item: ClassifiedPost): number {
  const n = item.normalized;
  return (
    n.content.length +
    n.imageUrls.length * 120 +
    n.dishTags.length * 80 +
    (n.priceMin || n.priceMax ? 160 : 0) +
    (n.area.addressText ? 160 : 0) +
    (n.source.postUrl ? 200 : 0) +
    Math.min(1200, item.signals.engagementScore)
  );
}

function classify(
  normalized: NormalizedFoodReviewInput,
  raw: RawPost,
  sourceFile: string,
  rowNumber: number
): ClassifiedPost {
  const content = normalized.content || "";
  const groupTitle = normalized.source.groupTitle || "";
  const merged = `${content}\n${groupTitle}`;
  const text = normalizeForMatch(merged);
  const contentHash = canonicalContentHash(content);
  const dedupeKey = getDedupeKey(normalized, contentHash);

  const foodSignalCount = countHits(text, FOOD_KEYWORDS);
  const isQuestionOnly = startsOrEarlyContains(text, QUESTION_PATTERNS);
  const isJobOrSpam = containsAny(text, JOB_OR_SPAM_PATTERNS);
  const isEventOrTravel = containsAny(text, EVENT_OR_TRAVEL_PATTERNS);
  const isHardEventOrTravel = containsAny(text, HARD_EVENT_OR_TRAVEL_PATTERNS);
  const isWarning = containsAny(text, WARNING_PATTERNS);
  const isComplaint = containsAny(text, COMPLAINT_PATTERNS);
  const isPromotion = containsAny(text, PROMOTION_PATTERNS);
  const isRecommendation = containsAny(text, RECOMMENDATION_PATTERNS);
  const isStrongOpinion = containsAny(text, STRONG_OPINION_PATTERNS);
  const hasAddress = Boolean(normalized.area.addressText);
  const hasPrice = Boolean(normalized.priceMin || normalized.priceMax);
  const dishTagCount = normalized.dishTags.length;
  const commentsCount = normalized.engagement.commentsCount || 0;
  const engagementScore = normalized.engagement.score || 0;
  const hasFoodSignals = foodSignalCount >= 2 || dishTagCount > 0 || normalizeForMatch(groupTitle).includes("food");

  let postType: PostType = "non_food";
  if (isJobOrSpam) {
    postType = "job_or_spam";
  } else if (isHardEventOrTravel && !(isComplaint || isWarning) && foodSignalCount < 5) {
    postType = "event_or_travel";
  } else if (isEventOrTravel && !isComplaint && !isWarning && foodSignalCount < 4) {
    postType = "event_or_travel";
  } else if (isQuestionOnly && !isComplaint && !isWarning) {
    postType = "food_question";
  } else if (isWarning && hasFoodSignals) {
    postType = "food_warning";
  } else if (isComplaint && hasFoodSignals) {
    postType = "food_complaint";
  } else if (isPromotion && hasFoodSignals) {
    postType = "food_promotion";
  } else if (isRecommendation && hasFoodSignals) {
    postType = "food_recommendation";
  } else if (isEventOrTravel) {
    postType = "event_or_travel";
  } else if (hasFoodSignals) {
    postType = "food_review";
  }

  const reasons: string[] = [];
  let decision: KeepDecision = "keep";

  if (content.length < MIN_CONTENT_CHARS) {
    decision = "reject";
    reasons.push("too_short");
  }

  if (!normalized.source.postUrl) {
    decision = "reject";
    reasons.push("missing_post_url");
  }

  if (postType === "job_or_spam" || postType === "non_food" || postType === "event_or_travel") {
    decision = "reject";
    reasons.push(`post_type_${postType}`);
  }

  if (postType === "food_question") {
    decision = "reject";
    reasons.push("question_without_grounded_review");
  }

  if (!hasFoodSignals) {
    decision = "reject";
    reasons.push("weak_food_signal");
  }

  if (decision === "keep") {
    reasons.push(`kept_${postType}`);
  }

  return {
    normalized,
    raw,
    sourceFile,
    rowNumber,
    dedupeKey,
    contentHash,
    postType,
    decision,
    reasons,
    signals: {
      foodSignalCount,
      dishTagCount,
      hasAddress,
      hasPrice,
      commentsCount,
      engagementScore,
      isStrongOpinion,
    },
  };
}

function readJsonFile(filePath: string): unknown[] {
  const rawText = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(rawText);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    for (const key of ["data", "items", "posts", "reviews"]) {
      if (Array.isArray(record[key])) {
        return record[key] as unknown[];
      }
    }
  }
  return [];
}

function collectInputFiles(inputDir: string): string[] {
  return fs
    .readdirSync(inputDir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .map((name) => path.join(inputDir, name))
    .sort((a, b) => a.localeCompare(b));
}

function chooseCommentPriority(item: ClassifiedPost): number {
  const { postType, signals } = item;
  if ((postType === "food_warning" || postType === "food_complaint") && signals.commentsCount >= 10) {
    return 1;
  }
  if (signals.isStrongOpinion && signals.commentsCount >= 20) {
    return 2;
  }
  if (signals.commentsCount >= 50 || signals.engagementScore >= 300) {
    return 3;
  }
  if (postType === "food_promotion" && signals.commentsCount >= 20) {
    return 4;
  }
  if ((signals.hasAddress || signals.hasPrice) && signals.commentsCount >= 10) {
    return 5;
  }
  return 0;
}

function commentFetchReason(item: ClassifiedPost, priority: number): string {
  if (priority === 1) return "complaint_or_warning_with_comments";
  if (priority === 2) return "strong_opinion_with_many_comments";
  if (priority === 3) return "high_engagement_or_many_comments";
  if (priority === 4) return "promotion_needs_comment_validation";
  if (priority === 5) return "useful_review_with_comments";
  return "not_prioritized";
}

function toPendingReviewRecord(item: ClassifiedPost) {
  const priority = chooseCommentPriority(item);
  return {
    ...item.normalized,
    cleaning: {
      decision: item.decision,
      postType: item.postType,
      reasons: item.reasons,
      sourceFile: item.sourceFile,
      rowNumber: item.rowNumber,
      dedupeKey: item.dedupeKey,
      contentHash: item.contentHash,
      signals: item.signals,
    },
    commentFetchPlan: {
      fetchRecommended: priority > 0,
      priority,
      reason: commentFetchReason(item, priority),
      postUrl: item.normalized.source.postUrl,
      commentsCount: item.signals.commentsCount,
    },
  };
}

function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(filePath: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    fs.writeFileSync(filePath, "", "utf-8");
    return;
  }
  const headers = Object.keys(rows[0] || {});
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf-8");
}

function countBy<T extends string>(items: T[]): Record<T, number> {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function main() {
  const inputDir = path.resolve(process.argv[2] || DEFAULT_INPUT_DIR);
  const outputDir = path.resolve(process.argv[3] || DEFAULT_OUTPUT_DIR);

  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const files = collectInputFiles(inputDir);
  const classified: ClassifiedPost[] = [];
  const loadErrors: Array<{ sourceFile: string; error: string }> = [];

  for (const filePath of files) {
    const sourceFile = path.basename(filePath);
    let rows: unknown[] = [];
    try {
      rows = readJsonFile(filePath);
    } catch (error) {
      loadErrors.push({ sourceFile, error: error instanceof Error ? error.message : String(error) });
      continue;
    }

    rows.forEach((row, index) => {
      if (!row || typeof row !== "object") {
        return;
      }
      const raw = row as RawPost;
      const normalized = normalizeFacebookFoodPost(raw);
      if (!normalized) {
        return;
      }
      classified.push(classify(normalized, raw, sourceFile, index + 1));
    });
  }

  const bestByKey = new Map<string, ClassifiedPost>();
  const duplicateRows: Record<string, unknown>[] = [];

  for (const item of classified) {
    const existing = bestByKey.get(item.dedupeKey);
    if (!existing) {
      bestByKey.set(item.dedupeKey, item);
      continue;
    }

    const existingScore = completenessScore(existing);
    const nextScore = completenessScore(item);
    const kept = nextScore > existingScore ? item : existing;
    const dropped = nextScore > existingScore ? existing : item;
    bestByKey.set(item.dedupeKey, kept);
    duplicateRows.push({
      dedupeKey: item.dedupeKey,
      keptSourceFile: kept.sourceFile,
      keptRowNumber: kept.rowNumber,
      droppedSourceFile: dropped.sourceFile,
      droppedRowNumber: dropped.rowNumber,
      keptScore: completenessScore(kept),
      droppedScore: completenessScore(dropped),
      postUrl: kept.normalized.source.postUrl,
    });
  }

  const uniqueItems = [...bestByKey.values()];
  const accepted = uniqueItems
    .filter((item) => item.decision === "keep")
    .sort((a, b) => completenessScore(b) - completenessScore(a));
  const rejected = uniqueItems
    .filter((item) => item.decision === "reject")
    .sort((a, b) => a.postType.localeCompare(b.postType) || b.signals.engagementScore - a.signals.engagementScore);

  const acceptedRecords = accepted.map(toPendingReviewRecord);
  const commentCandidates = accepted
    .map((item) => ({ item, priority: chooseCommentPriority(item) }))
    .filter(({ priority }) => priority > 0)
    .sort((a, b) => a.priority - b.priority || b.item.signals.commentsCount - a.item.signals.commentsCount)
    .map(({ item, priority }) => ({
      postUrl: item.normalized.source.postUrl,
      postLegacyId: item.normalized.source.postLegacyId,
      title: item.normalized.title,
      postType: item.postType,
      priority,
      reason: commentFetchReason(item, priority),
      commentsCount: item.signals.commentsCount,
      engagementScore: item.signals.engagementScore,
      groupTitle: item.normalized.source.groupTitle,
      sourceFile: item.sourceFile,
      rowNumber: item.rowNumber,
    }));

  const rejectedRows = rejected.map((item) => ({
    sourceFile: item.sourceFile,
    rowNumber: item.rowNumber,
    postType: item.postType,
    reasons: item.reasons.join("|"),
    title: item.normalized.title,
    contentPreview: item.normalized.content.replace(/\s+/g, " ").slice(0, 220),
    postUrl: item.normalized.source.postUrl,
    commentsCount: item.signals.commentsCount,
    foodSignalCount: item.signals.foodSignalCount,
    dishTags: item.normalized.dishTags.join("|"),
  }));

  const summary = {
    schemaVersion: "foodtour_cleaning_summary_v1",
    createdAt: new Date().toISOString(),
    inputDir,
    outputDir,
    filesRead: files.length,
    loadErrors,
    rawNormalizedRows: classified.length,
    uniqueRows: uniqueItems.length,
    duplicatesRemoved: classified.length - uniqueItems.length,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    commentFetchCandidateCount: commentCandidates.length,
    acceptedByPostType: countBy(accepted.map((item) => item.postType)),
    rejectedByPostType: countBy(rejected.map((item) => item.postType)),
    acceptedWithAddress: accepted.filter((item) => item.signals.hasAddress).length,
    acceptedWithPrice: accepted.filter((item) => item.signals.hasPrice).length,
    acceptedWithDishTags: accepted.filter((item) => item.signals.dishTagCount > 0).length,
  };

  const cleanPath = path.join(outputDir, "foodtour_clean_posts_pending_review.json");
  const rejectedPath = path.join(outputDir, "foodtour_rejected_posts_audit.csv");
  const duplicatePath = path.join(outputDir, "foodtour_duplicate_posts_audit.csv");
  const commentPath = path.join(outputDir, "foodtour_comment_fetch_candidates.json");
  const summaryPath = path.join(outputDir, "foodtour_cleaning_summary.json");

  fs.writeFileSync(
    cleanPath,
    JSON.stringify(
      {
        schemaVersion: "foodtour_clean_posts_pending_review_v1",
        createdAt: new Date().toISOString(),
        sourceDir: inputDir,
        reviewNote:
          "Pending human review only. This file has not been imported into DB and comments have not been fetched yet.",
        records: acceptedRecords,
      },
      null,
      2
    ),
    "utf-8"
  );
  fs.writeFileSync(
    commentPath,
    JSON.stringify(
      {
        schemaVersion: "foodtour_comment_fetch_candidates_v1",
        createdAt: new Date().toISOString(),
        sourceCleanPosts: path.basename(cleanPath),
        candidates: commentCandidates,
      },
      null,
      2
    ),
    "utf-8"
  );
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
  writeCsv(rejectedPath, rejectedRows);
  writeCsv(duplicatePath, duplicateRows);

  console.log("=== Foodtour crawl cleaning complete ===");
  console.log(`Files read              : ${files.length}`);
  console.log(`Raw normalized rows     : ${classified.length}`);
  console.log(`Unique rows             : ${uniqueItems.length}`);
  console.log(`Duplicates removed      : ${classified.length - uniqueItems.length}`);
  console.log(`Accepted pending review : ${accepted.length}`);
  console.log(`Rejected                : ${rejected.length}`);
  console.log(`Comment candidates      : ${commentCandidates.length}`);
  console.log(`Clean posts             : ${cleanPath}`);
  console.log(`Rejected audit          : ${rejectedPath}`);
  console.log(`Duplicate audit         : ${duplicatePath}`);
  console.log(`Comment candidates      : ${commentPath}`);
  console.log(`Summary                 : ${summaryPath}`);
}

main();
