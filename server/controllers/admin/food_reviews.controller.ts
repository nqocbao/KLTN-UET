import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import FoodReview from "../../models/food_reviews.model.js";
import {
  normalizeFacebookFoodPost,
  type FacebookFoodPost,
  type NormalizedFoodReviewInput,
} from "../../utils/food-review-normalizer.js";

const MAX_IMPORT_ROWS = 10000;
const MAX_COMMIT_ERROR_ROWS = 200;
const MAX_PREVIEW_PAGE_SIZE = 200;
const DEFAULT_PREVIEW_PAGE_SIZE = 50;
const PREVIEW_SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_PREVIEW_SESSIONS = 100;

const WARNING_KEYS = [
  "missing_posted_at",
  "missing_images",
  "missing_price",
  "missing_phone",
  "missing_city",
  "missing_district",
  "missing_dish_tags",
] as const;

type WarningKey = (typeof WARNING_KEYS)[number];
type PreviewStatusFilter = "all" | "valid" | "invalid";

interface PreviewEditableDraft {
  title: string;
  summary: string;
  content: string;
  area: {
    city: string;
    district: string | null;
    ward: string | null;
    addressText: string | null;
  };
  dishTags: string[];
  hashtags: string[];
  contactPhones: string[];
  priceMin: number | null;
  priceMax: number | null;
  imageUrls: string[];
  postedAt: string | null;
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    reactionsCount: number;
    score: number;
  };
  source: {
    postUrl: string;
    postLegacyId: string | null;
    groupTitle: string | null;
    groupId: string | null;
    rawInputUrl: string | null;
    authorName: string | null;
    authorId: string | null;
  };
  isActive: boolean;
}

interface PreviewEditableDraftPatch {
  title?: string;
  summary?: string;
  content?: string;
  area?: {
    city?: string;
    district?: string | null;
    ward?: string | null;
    addressText?: string | null;
  };
  dishTags?: string[];
  hashtags?: string[];
  contactPhones?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  imageUrls?: string[];
  postedAt?: string | null;
  engagement?: {
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
    reactionsCount?: number;
    score?: number;
  };
  source?: {
    postUrl?: string;
    postLegacyId?: string | null;
    groupTitle?: string | null;
    groupId?: string | null;
    rawInputUrl?: string | null;
    authorName?: string | null;
    authorId?: string | null;
  };
  isActive?: boolean;
}

interface EvaluatedRow {
  row: number;
  status: "valid" | "invalid";
  reason?: string;
  warnings: WarningKey[];
  sourceUrl: string | null;
  title: string | null;
  editable: PreviewEditableDraft;
  originalRawPayload: unknown;
  normalized?: NormalizedFoodReviewInput;
}

interface EvaluatedImportResult {
  rows: EvaluatedRow[];
  validRows: EvaluatedRow[];
  invalidRows: EvaluatedRow[];
  warningCounts: Record<WarningKey, number>;
}

interface PreviewImportSession {
  sessionId: string;
  recordsCount: number;
  evaluated: EvaluatedImportResult;
  createdAt: number;
  expiresAt: number;
}

const previewImportSessions = new Map<string, PreviewImportSession>();

function toSafeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSafeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNonNegativeNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function toDateIsoString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function buildTitleFromContent(content: string): string {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) return "";
  return firstLine.slice(0, 120);
}

function buildSummaryFromContent(content: string): string {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= 220) return compact;
  return `${compact.slice(0, 217)}...`;
}

function extractImageUrlsFromRaw(attachments: unknown): string[] {
  if (!Array.isArray(attachments)) return [];

  const urls: string[] = [];
  for (const item of attachments) {
    if (!item || typeof item !== "object") continue;
    const source = item as Record<string, unknown>;

    const thumbnail = typeof source.thumbnail === "string" ? source.thumbnail.trim() : "";
    if (thumbnail) {
      urls.push(thumbnail);
    }

    const imageValue = source.image;
    if (imageValue && typeof imageValue === "object") {
      const image = imageValue as Record<string, unknown>;
      const uri = typeof image.uri === "string" ? image.uri.trim() : "";
      if (uri) {
        urls.push(uri);
      }
    }
  }

  return [...new Set(urls)];
}

function buildEditableDraftFromNormalized(
  normalized: NormalizedFoodReviewInput
): PreviewEditableDraft {
  return {
    title: normalized.title,
    summary: normalized.summary,
    content: normalized.content,
    area: {
      city: normalized.area.city || "",
      district: normalized.area.district || null,
      ward: normalized.area.ward || null,
      addressText: normalized.area.addressText || null,
    },
    dishTags: [...normalized.dishTags],
    hashtags: [...normalized.hashtags],
    contactPhones: [...normalized.contactPhones],
    priceMin: normalized.priceMin ?? null,
    priceMax: normalized.priceMax ?? null,
    imageUrls: [...normalized.imageUrls],
    postedAt: normalized.postedAt ? normalized.postedAt.toISOString() : null,
    engagement: {
      likesCount: normalized.engagement.likesCount,
      commentsCount: normalized.engagement.commentsCount,
      sharesCount: normalized.engagement.sharesCount,
      reactionsCount: normalized.engagement.reactionsCount,
      score: normalized.engagement.score,
    },
    source: {
      postUrl: normalized.source.postUrl,
      postLegacyId: normalized.source.postLegacyId ?? null,
      groupTitle: normalized.source.groupTitle ?? null,
      groupId: normalized.source.groupId ?? null,
      rawInputUrl: normalized.source.rawInputUrl ?? null,
      authorName: normalized.source.authorName ?? null,
      authorId: normalized.source.authorId ?? null,
    },
    isActive: normalized.isActive !== false,
  };
}

function buildEditableDraftFromRaw(raw: unknown): PreviewEditableDraft {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const content = toSafeString(source.text);

  const title = buildTitleFromContent(content);
  const summary = buildSummaryFromContent(content);

  return {
    title,
    summary,
    content,
    area: {
      city: "",
      district: null,
      ward: null,
      addressText: null,
    },
    dishTags: [],
    hashtags: [],
    contactPhones: [],
    priceMin: null,
    priceMax: null,
    imageUrls: extractImageUrlsFromRaw(source.attachments),
    postedAt: toDateIsoString(source.time),
    engagement: {
      likesCount: toNonNegativeNumber(source.likesCount),
      commentsCount: toNonNegativeNumber(source.commentsCount),
      sharesCount: toNonNegativeNumber(source.sharesCount),
      reactionsCount:
        toNonNegativeNumber(source.topReactionsCount) +
        toNonNegativeNumber(source.reactionLikeCount) +
        toNonNegativeNumber(source.reactionLoveCount),
      score: 0,
    },
    source: {
      postUrl: toSafeString(source.url),
      postLegacyId: toSafeNullableString(source.legacyId),
      groupTitle: toSafeNullableString(source.groupTitle),
      groupId: toSafeNullableString(source.facebookId),
      rawInputUrl: toSafeNullableString(source.inputUrl),
      authorName:
        source.user && typeof source.user === "object"
          ? toSafeNullableString((source.user as Record<string, unknown>).name)
          : null,
      authorId:
        source.user && typeof source.user === "object"
          ? toSafeNullableString((source.user as Record<string, unknown>).id)
          : null,
    },
    isActive: true,
  };
}

function validatePreviewEditableDraft(
  draft: PreviewEditableDraft,
  rawPayload: unknown
): {
  normalized: NormalizedFoodReviewInput | null;
  reason: string | null;
  warnings: WarningKey[];
} {
  const postUrl = draft.source.postUrl.trim();
  if (!postUrl) {
    return { normalized: null, reason: "Thiếu source.postUrl", warnings: [] };
  }

  if (!isHttpUrl(postUrl)) {
    return { normalized: null, reason: "source.postUrl không hợp lệ", warnings: [] };
  }

  const title = draft.title.trim();
  if (!title) {
    return { normalized: null, reason: "Thiếu title", warnings: [] };
  }

  const summary = draft.summary.trim();
  if (!summary) {
    return { normalized: null, reason: "Thiếu summary", warnings: [] };
  }

  const content = draft.content.trim();
  if (!content) {
    return { normalized: null, reason: "Thiếu content", warnings: [] };
  }

  const city = draft.area.city.trim();
  if (!city) {
    return { normalized: null, reason: "Thiếu area.city", warnings: [] };
  }

  if (
    draft.priceMin !== null &&
    draft.priceMax !== null &&
    draft.priceMin > draft.priceMax
  ) {
    return {
      normalized: null,
      reason: "priceMin không được lớn hơn priceMax",
      warnings: [],
    };
  }

  const invalidImage = draft.imageUrls.find((url) => !isHttpUrl(url));
  if (invalidImage) {
    return {
      normalized: null,
      reason: `imageUrl không hợp lệ: ${invalidImage}`,
      warnings: [],
    };
  }

  const normalizedPhones = normalizePhoneList(draft.contactPhones);
  if (normalizedPhones.invalid.length > 0) {
    return {
      normalized: null,
      reason: `Số điện thoại không hợp lệ: ${normalizedPhones.invalid.join(", ")}`,
      warnings: [],
    };
  }

  let postedAt: Date | null = null;
  if (draft.postedAt) {
    const parsedDate = new Date(draft.postedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return { normalized: null, reason: "postedAt không đúng định dạng ngày", warnings: [] };
    }
    postedAt = parsedDate;
  }

  const normalized: NormalizedFoodReviewInput = {
    title,
    summary,
    content,
    area: {
      city,
      district: draft.area.district,
      ward: draft.area.ward,
      addressText: draft.area.addressText,
    },
    dishTags: normalizeDishTags(draft.dishTags),
    hashtags: normalizeHashtags(draft.hashtags),
    contactPhones: normalizedPhones.valid,
    priceMin: draft.priceMin,
    priceMax: draft.priceMax,
    imageUrls: [...new Set(draft.imageUrls)],
    postedAt,
    engagement: {
      likesCount: toNonNegativeNumber(draft.engagement.likesCount),
      commentsCount: toNonNegativeNumber(draft.engagement.commentsCount),
      sharesCount: toNonNegativeNumber(draft.engagement.sharesCount),
      reactionsCount: toNonNegativeNumber(draft.engagement.reactionsCount),
      score: toNonNegativeNumber(draft.engagement.score),
    },
    source: {
      platform: "facebook",
      groupTitle: draft.source.groupTitle,
      groupId: draft.source.groupId,
      postUrl,
      postLegacyId: draft.source.postLegacyId,
      rawInputUrl: draft.source.rawInputUrl,
      authorName: draft.source.authorName,
      authorId: draft.source.authorId,
    },
    isActive: draft.isActive,
    rawPayload,
  };

  const warnings = collectWarnings(normalized);
  return { normalized, reason: null, warnings };
}

function parsePreviewStatusFilter(value: unknown): PreviewStatusFilter {
  if (value === "valid" || value === "invalid") {
    return value;
  }
  return "all";
}

function toPositiveInt(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), max);
}

function buildWarningCounts(): Record<WarningKey, number> {
  return {
    missing_posted_at: 0,
    missing_images: 0,
    missing_price: 0,
    missing_phone: 0,
    missing_city: 0,
    missing_district: 0,
    missing_dish_tags: 0,
  };
}

function collectWarnings(normalized: NormalizedFoodReviewInput): WarningKey[] {
  const warnings: WarningKey[] = [];

  if (!normalized.postedAt) warnings.push("missing_posted_at");
  if (!normalized.imageUrls || normalized.imageUrls.length === 0) {
    warnings.push("missing_images");
  }
  if (!normalized.priceMin && !normalized.priceMax) warnings.push("missing_price");
  if (!normalized.contactPhones || normalized.contactPhones.length === 0) {
    warnings.push("missing_phone");
  }
  if (!normalized.area?.city || normalized.area.city.trim().length === 0 || normalized.area.city === "Chưa xác định") {
    warnings.push("missing_city");
  }
  if (!normalized.area?.district) warnings.push("missing_district");
  if (!normalized.dishTags || normalized.dishTags.length === 0) {
    warnings.push("missing_dish_tags");
  }

  return warnings;
}

function rowToResponse(row: EvaluatedRow) {
  return {
    row: row.row,
    status: row.status,
    reason: row.reason || null,
    warnings: row.warnings,
    sourceUrl: row.sourceUrl,
    title: row.title,
  };
}

function recomputeEvaluatedRows(rows: EvaluatedRow[]): EvaluatedImportResult {
  const warningCounts = buildWarningCounts();
  const seenKeys = new Set<string>();

  for (const row of rows) {
    const validation = validatePreviewEditableDraft(row.editable, row.originalRawPayload);
    row.sourceUrl = row.editable.source.postUrl || null;
    row.title = row.editable.title || null;

    if (!validation.normalized) {
      row.status = "invalid";
      row.reason = validation.reason || "Missing required fields";
      row.warnings = [];
      delete row.normalized;
      continue;
    }

    const dedupeKey = validation.normalized.source.postLegacyId
      ? `legacy:${validation.normalized.source.postLegacyId}`
      : `url:${validation.normalized.source.postUrl}`;

    if (seenKeys.has(dedupeKey)) {
      row.status = "invalid";
      row.reason = "Duplicate record in import file";
      row.warnings = [];
      delete row.normalized;
      continue;
    }

    seenKeys.add(dedupeKey);
    row.status = "valid";
    delete row.reason;
    row.warnings = validation.warnings;
    row.normalized = validation.normalized;

    for (const warning of row.warnings) {
      warningCounts[warning] += 1;
    }
  }

  const validRows = rows.filter((row) => row.status === "valid");
  const invalidRows = rows.filter((row) => row.status === "invalid");

  return {
    rows,
    validRows,
    invalidRows,
    warningCounts,
  };
}

function evaluateImportRows(records: unknown[]): EvaluatedImportResult {
  const rows: EvaluatedRow[] = records.map((raw, index) => {
    const normalized =
      raw && typeof raw === "object"
        ? normalizeFacebookFoodPost(raw as FacebookFoodPost)
        : null;

    const editable = normalized
      ? buildEditableDraftFromNormalized(normalized)
      : buildEditableDraftFromRaw(raw);

    const row: EvaluatedRow = {
      row: index + 1,
      status: normalized ? "valid" : "invalid",
      warnings: normalized ? collectWarnings(normalized) : [],
      sourceUrl: editable.source.postUrl || null,
      title: editable.title || null,
      editable,
      originalRawPayload: raw,
    };

    if (normalized) {
      row.normalized = normalized;
    } else {
      row.reason = "Missing required fields (url/text) or invalid content";
    }

    return row;
  });

  return recomputeEvaluatedRows(rows);
}

function toPreviewPageSize(value: unknown): number {
  return toPositiveInt(value, DEFAULT_PREVIEW_PAGE_SIZE, MAX_PREVIEW_PAGE_SIZE);
}

function pruneExpiredPreviewSessions() {
  const now = Date.now();
  for (const [sessionId, session] of previewImportSessions.entries()) {
    if (session.expiresAt <= now) {
      previewImportSessions.delete(sessionId);
    }
  }
}

function ensurePreviewSessionCapacity() {
  pruneExpiredPreviewSessions();
  if (previewImportSessions.size < MAX_PREVIEW_SESSIONS) {
    return;
  }

  const sessions = Array.from(previewImportSessions.values()).sort(
    (a, b) => a.createdAt - b.createdAt
  );

  const overflow = previewImportSessions.size - MAX_PREVIEW_SESSIONS + 1;
  for (let i = 0; i < overflow && i < sessions.length; i += 1) {
    const candidate = sessions[i];
    if (candidate) {
      previewImportSessions.delete(candidate.sessionId);
    }
  }
}

function createPreviewImportSession(
  recordsCount: number,
  evaluated: EvaluatedImportResult
): PreviewImportSession {
  ensurePreviewSessionCapacity();

  const createdAt = Date.now();
  const session: PreviewImportSession = {
    sessionId: randomUUID(),
    recordsCount,
    evaluated,
    createdAt,
    expiresAt: createdAt + PREVIEW_SESSION_TTL_MS,
  };

  previewImportSessions.set(session.sessionId, session);
  return session;
}

function getPreviewImportSession(
  sessionId: string
): PreviewImportSession | null {
  pruneExpiredPreviewSessions();
  const session = previewImportSessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    previewImportSessions.delete(sessionId);
    return null;
  }

  return session;
}

function buildPreviewSummary(
  totalRecords: number,
  evaluated: EvaluatedImportResult
) {
  return {
    totalRecords,
    validRecords: evaluated.validRows.length,
    invalidRecords: evaluated.invalidRows.length,
    warningCounts: evaluated.warningCounts,
  };
}

function buildPreviewPage(
  rows: EvaluatedRow[],
  requestedPage: number,
  pageSize: number,
  statusFilter: PreviewStatusFilter
) {
  const filteredRows =
    statusFilter === "all"
      ? rows
      : rows.filter((row) => row.status === statusFilter);

  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (page - 1) * pageSize;
  const slicedRows = filteredRows.slice(start, start + pageSize).map(rowToResponse);

  return {
    page,
    limit: pageSize,
    statusFilter,
    totalRows,
    totalPages,
    rows: slicedRows,
  };
}

async function commitEvaluatedRows(
  totalRecords: number,
  evaluated: EvaluatedImportResult
) {
  let insertedRecords = 0;
  let updatedRecords = 0;
  const failedRows: Array<{ row: number; reason: string; sourceUrl: string | null }> = [];

  for (const row of evaluated.validRows) {
    const normalized = row.normalized;
    if (!normalized) {
      failedRows.push({
        row: row.row,
        reason: "Normalized payload is missing",
        sourceUrl: row.sourceUrl,
      });
      continue;
    }

    const filter = normalized.source.postLegacyId
      ? { "source.postLegacyId": normalized.source.postLegacyId }
      : { "source.postUrl": normalized.source.postUrl };

    try {
      const writeResult = await FoodReview.updateOne(
        filter,
        { $set: normalized },
        { upsert: true }
      );

      if (writeResult.upsertedCount > 0) {
        insertedRecords += 1;
      } else {
        updatedRecords += 1;
      }
    } catch (error: any) {
      failedRows.push({
        row: row.row,
        reason: error.message || "Unknown database error",
        sourceUrl: row.sourceUrl,
      });
    }
  }

  const failedCount = failedRows.length;
  const skippedRecords = evaluated.invalidRows.length + failedCount;

  return {
    totalRecords,
    validRecords: evaluated.validRows.length,
    invalidRecords: evaluated.invalidRows.length,
    insertedRecords,
    updatedRecords,
    failedRecords: failedCount,
    skippedRecords,
    warningCounts: evaluated.warningCounts,
    invalidRows: evaluated.invalidRows
      .slice(0, MAX_COMMIT_ERROR_ROWS)
      .map(rowToResponse),
    failedRows: failedRows.slice(0, MAX_COMMIT_ERROR_ROWS),
  };
}

function extractRecords(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];
  const maybeRecords = (body as { records?: unknown }).records;
  return Array.isArray(maybeRecords) ? maybeRecords : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseStringArray(value: unknown): string[] | null {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    const strings: string[] = [];
    for (const item of value) {
      if (typeof item !== "string") return null;
      const trimmed = item.trim();
      if (trimmed.length > 0) strings.push(trimmed);
    }
    return [...new Set(strings)];
  }

  if (typeof value === "string") {
    const strings = value
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return [...new Set(strings)];
  }

  return null;
}

function parseNumberOrNull(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < 0) return undefined;
  return parsed;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePhoneList(values: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const value of values) {
    const digits = value.replace(/[^0-9+]/g, "");
    const normalized = digits.startsWith("+84")
      ? `0${digits.slice(3)}`
      : digits.startsWith("84")
        ? `0${digits.slice(2)}`
        : digits;

    if (/^0\d{9,10}$/.test(normalized)) {
      valid.push(normalized);
    } else {
      invalid.push(value);
    }
  }

  return {
    valid: [...new Set(valid)],
    invalid,
  };
}

function normalizeHashtags(values: string[]): string[] {
  return [
    ...new Set(
      values
        .map((value) => value.replace(/^#/, "").trim().toLowerCase())
        .filter((value) => value.length > 0)
    ),
  ];
}

function normalizeDishTags(values: string[]): string[] {
  return [
    ...new Set(values.map((value) => value.trim().toLowerCase()).filter((value) => value.length > 0)),
  ];
}

function parsePostedAt(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function sanitizeUpdatePayload(payload: unknown) {
  if (!isRecord(payload)) {
    return { update: null, errors: ["Payload cập nhật không hợp lệ"] };
  }

  const update: Record<string, unknown> = {};
  const errors: string[] = [];

  if ("title" in payload) {
    const title = toNonEmptyString(payload.title);
    if (!title) errors.push("title là bắt buộc và không được để trống");
    else update.title = title;
  }

  if ("summary" in payload) {
    const summary = toNonEmptyString(payload.summary);
    if (!summary) errors.push("summary là bắt buộc và không được để trống");
    else update.summary = summary;
  }

  if ("content" in payload) {
    const content = toNonEmptyString(payload.content);
    if (!content) errors.push("content là bắt buộc và không được để trống");
    else update.content = content;
  }

  if ("area" in payload) {
    if (!isRecord(payload.area)) {
      errors.push("area phải là object hợp lệ");
    } else {
      const areaPayload = payload.area;

      if ("city" in areaPayload) {
        const city = toNonEmptyString(areaPayload.city);
        if (!city) errors.push("area.city không được để trống");
        else update["area.city"] = city;
      }

      if ("district" in areaPayload) {
        update["area.district"] = toNullableString(areaPayload.district);
      }

      if ("ward" in areaPayload) {
        update["area.ward"] = toNullableString(areaPayload.ward);
      }

      if ("addressText" in areaPayload) {
        update["area.addressText"] = toNullableString(areaPayload.addressText);
      }
    }
  }

  if ("dishTags" in payload) {
    const parsed = parseStringArray(payload.dishTags);
    if (parsed === null) errors.push("dishTags phải là mảng string hoặc chuỗi");
    else update.dishTags = normalizeDishTags(parsed);
  }

  if ("hashtags" in payload) {
    const parsed = parseStringArray(payload.hashtags);
    if (parsed === null) errors.push("hashtags phải là mảng string hoặc chuỗi");
    else update.hashtags = normalizeHashtags(parsed);
  }

  if ("contactPhones" in payload) {
    const parsed = parseStringArray(payload.contactPhones);
    if (parsed === null) {
      errors.push("contactPhones phải là mảng string hoặc chuỗi");
    } else {
      const normalized = normalizePhoneList(parsed);
      if (normalized.invalid.length > 0) {
        errors.push(`Số điện thoại không hợp lệ: ${normalized.invalid.join(", ")}`);
      }
      update.contactPhones = normalized.valid;
    }
  }

  if ("imageUrls" in payload) {
    const parsed = parseStringArray(payload.imageUrls);
    if (parsed === null) {
      errors.push("imageUrls phải là mảng string hoặc chuỗi");
    } else {
      const invalidUrls = parsed.filter((url) => !isHttpUrl(url));
      if (invalidUrls.length > 0) {
        errors.push(`imageUrls không hợp lệ: ${invalidUrls.join(", ")}`);
      }
      update.imageUrls = parsed.filter((url) => isHttpUrl(url));
    }
  }

  if ("priceMin" in payload) {
    const priceMin = parseNumberOrNull(payload.priceMin);
    if (priceMin === undefined) errors.push("priceMin phải là số >= 0 hoặc null");
    else update.priceMin = priceMin;
  }

  if ("priceMax" in payload) {
    const priceMax = parseNumberOrNull(payload.priceMax);
    if (priceMax === undefined) errors.push("priceMax phải là số >= 0 hoặc null");
    else update.priceMax = priceMax;
  }

  if ("postedAt" in payload) {
    const postedAt = parsePostedAt(payload.postedAt);
    if (postedAt === undefined) errors.push("postedAt không đúng định dạng ngày");
    else update.postedAt = postedAt;
  }

  if ("isActive" in payload) {
    if (typeof payload.isActive !== "boolean") {
      errors.push("isActive phải là boolean");
    } else {
      update.isActive = payload.isActive;
    }
  }

  return {
    update,
    errors,
  };
}

function sanitizePreviewEditableDraftPatch(payload: unknown): {
  patch: PreviewEditableDraftPatch | null;
  errors: string[];
} {
  if (!isRecord(payload)) {
    return { patch: null, errors: ["Payload cập nhật preview không hợp lệ"] };
  }

  const patch: PreviewEditableDraftPatch = {};
  const errors: string[] = [];

  if ("title" in payload) {
    const title = toNonEmptyString(payload.title);
    if (!title) errors.push("title không được để trống");
    else patch.title = title;
  }

  if ("summary" in payload) {
    const summary = toNonEmptyString(payload.summary);
    if (!summary) errors.push("summary không được để trống");
    else patch.summary = summary;
  }

  if ("content" in payload) {
    const content = toNonEmptyString(payload.content);
    if (!content) errors.push("content không được để trống");
    else patch.content = content;
  }

  if ("area" in payload) {
    if (!isRecord(payload.area)) {
      errors.push("area phải là object hợp lệ");
    } else {
      const areaPayload = payload.area;
      const areaPatch: NonNullable<PreviewEditableDraftPatch["area"]> = {};

      if ("city" in areaPayload) {
        const city = toNonEmptyString(areaPayload.city);
        if (!city) errors.push("area.city không được để trống");
        else areaPatch.city = city;
      }

      if ("district" in areaPayload) {
        areaPatch.district = toNullableString(areaPayload.district);
      }

      if ("ward" in areaPayload) {
        areaPatch.ward = toNullableString(areaPayload.ward);
      }

      if ("addressText" in areaPayload) {
        areaPatch.addressText = toNullableString(areaPayload.addressText);
      }

      patch.area = areaPatch;
    }
  }

  if ("dishTags" in payload) {
    const parsed = parseStringArray(payload.dishTags);
    if (parsed === null) errors.push("dishTags phải là mảng string hoặc chuỗi");
    else patch.dishTags = normalizeDishTags(parsed);
  }

  if ("hashtags" in payload) {
    const parsed = parseStringArray(payload.hashtags);
    if (parsed === null) errors.push("hashtags phải là mảng string hoặc chuỗi");
    else patch.hashtags = normalizeHashtags(parsed);
  }

  if ("contactPhones" in payload) {
    const parsed = parseStringArray(payload.contactPhones);
    if (parsed === null) errors.push("contactPhones phải là mảng string hoặc chuỗi");
    else patch.contactPhones = parsed;
  }

  if ("imageUrls" in payload) {
    const parsed = parseStringArray(payload.imageUrls);
    if (parsed === null) {
      errors.push("imageUrls phải là mảng string hoặc chuỗi");
    } else {
      const invalidUrls = parsed.filter((url) => !isHttpUrl(url));
      if (invalidUrls.length > 0) {
        errors.push(`imageUrls không hợp lệ: ${invalidUrls.join(", ")}`);
      } else {
        patch.imageUrls = parsed;
      }
    }
  }

  if ("priceMin" in payload) {
    const priceMin = parseNumberOrNull(payload.priceMin);
    if (priceMin === undefined) errors.push("priceMin phải là số >= 0 hoặc null");
    else patch.priceMin = priceMin;
  }

  if ("priceMax" in payload) {
    const priceMax = parseNumberOrNull(payload.priceMax);
    if (priceMax === undefined) errors.push("priceMax phải là số >= 0 hoặc null");
    else patch.priceMax = priceMax;
  }

  if ("postedAt" in payload) {
    if (payload.postedAt === null || payload.postedAt === "") {
      patch.postedAt = null;
    } else if (typeof payload.postedAt === "string") {
      const parsedDate = new Date(payload.postedAt);
      if (Number.isNaN(parsedDate.getTime())) {
        errors.push("postedAt không đúng định dạng ngày");
      } else {
        patch.postedAt = parsedDate.toISOString();
      }
    } else {
      errors.push("postedAt không đúng định dạng ngày");
    }
  }

  if ("engagement" in payload) {
    if (!isRecord(payload.engagement)) {
      errors.push("engagement phải là object hợp lệ");
    } else {
      const engagementPayload = payload.engagement;
      const engagementPatch: NonNullable<PreviewEditableDraftPatch["engagement"]> = {};
      const engagementFields: Array<
        keyof NonNullable<PreviewEditableDraftPatch["engagement"]>
      > = ["likesCount", "commentsCount", "sharesCount", "reactionsCount", "score"];

      for (const field of engagementFields) {
        if (field in engagementPayload) {
          const value = Number(engagementPayload[field]);
          if (!Number.isFinite(value) || value < 0) {
            errors.push(`engagement.${field} phải là số >= 0`);
          } else {
            engagementPatch[field] = value;
          }
        }
      }

      patch.engagement = engagementPatch;
    }
  }

  if ("source" in payload) {
    if (!isRecord(payload.source)) {
      errors.push("source phải là object hợp lệ");
    } else {
      const sourcePayload = payload.source;
      const sourcePatch: NonNullable<PreviewEditableDraftPatch["source"]> = {};

      if ("postUrl" in sourcePayload) {
        const postUrl = toNonEmptyString(sourcePayload.postUrl);
        if (!postUrl) errors.push("source.postUrl không được để trống");
        else if (!isHttpUrl(postUrl)) errors.push("source.postUrl không hợp lệ");
        else sourcePatch.postUrl = postUrl;
      }

      if ("postLegacyId" in sourcePayload) {
        sourcePatch.postLegacyId = toNullableString(sourcePayload.postLegacyId);
      }

      if ("groupTitle" in sourcePayload) {
        sourcePatch.groupTitle = toNullableString(sourcePayload.groupTitle);
      }

      if ("groupId" in sourcePayload) {
        sourcePatch.groupId = toNullableString(sourcePayload.groupId);
      }

      if ("rawInputUrl" in sourcePayload) {
        sourcePatch.rawInputUrl = toNullableString(sourcePayload.rawInputUrl);
      }

      if ("authorName" in sourcePayload) {
        sourcePatch.authorName = toNullableString(sourcePayload.authorName);
      }

      if ("authorId" in sourcePayload) {
        sourcePatch.authorId = toNullableString(sourcePayload.authorId);
      }

      patch.source = sourcePatch;
    }
  }

  if ("isActive" in payload) {
    if (typeof payload.isActive !== "boolean") {
      errors.push("isActive phải là boolean");
    } else {
      patch.isActive = payload.isActive;
    }
  }

  return { patch, errors };
}

function applyPreviewEditableDraftPatch(
  current: PreviewEditableDraft,
  patch: PreviewEditableDraftPatch
): PreviewEditableDraft {
  const next: PreviewEditableDraft = {
    ...current,
    area: { ...current.area },
    dishTags: [...current.dishTags],
    hashtags: [...current.hashtags],
    contactPhones: [...current.contactPhones],
    imageUrls: [...current.imageUrls],
    engagement: { ...current.engagement },
    source: { ...current.source },
  };

  if (patch.title !== undefined) next.title = patch.title;
  if (patch.summary !== undefined) next.summary = patch.summary;
  if (patch.content !== undefined) next.content = patch.content;
  if (patch.dishTags !== undefined) next.dishTags = [...patch.dishTags];
  if (patch.hashtags !== undefined) next.hashtags = [...patch.hashtags];
  if (patch.contactPhones !== undefined) next.contactPhones = [...patch.contactPhones];
  if (patch.priceMin !== undefined) next.priceMin = patch.priceMin;
  if (patch.priceMax !== undefined) next.priceMax = patch.priceMax;
  if (patch.imageUrls !== undefined) next.imageUrls = [...patch.imageUrls];
  if (patch.postedAt !== undefined) next.postedAt = patch.postedAt;
  if (patch.isActive !== undefined) next.isActive = patch.isActive;

  if (patch.area) {
    if (patch.area.city !== undefined) next.area.city = patch.area.city;
    if (patch.area.district !== undefined) next.area.district = patch.area.district;
    if (patch.area.ward !== undefined) next.area.ward = patch.area.ward;
    if (patch.area.addressText !== undefined) next.area.addressText = patch.area.addressText;
  }

  if (patch.engagement) {
    if (patch.engagement.likesCount !== undefined) {
      next.engagement.likesCount = patch.engagement.likesCount;
    }
    if (patch.engagement.commentsCount !== undefined) {
      next.engagement.commentsCount = patch.engagement.commentsCount;
    }
    if (patch.engagement.sharesCount !== undefined) {
      next.engagement.sharesCount = patch.engagement.sharesCount;
    }
    if (patch.engagement.reactionsCount !== undefined) {
      next.engagement.reactionsCount = patch.engagement.reactionsCount;
    }
    if (patch.engagement.score !== undefined) {
      next.engagement.score = patch.engagement.score;
    }
  }

  if (patch.source) {
    if (patch.source.postUrl !== undefined) next.source.postUrl = patch.source.postUrl;
    if (patch.source.postLegacyId !== undefined) {
      next.source.postLegacyId = patch.source.postLegacyId;
    }
    if (patch.source.groupTitle !== undefined) {
      next.source.groupTitle = patch.source.groupTitle;
    }
    if (patch.source.groupId !== undefined) {
      next.source.groupId = patch.source.groupId;
    }
    if (patch.source.rawInputUrl !== undefined) {
      next.source.rawInputUrl = patch.source.rawInputUrl;
    }
    if (patch.source.authorName !== undefined) {
      next.source.authorName = patch.source.authorName;
    }
    if (patch.source.authorId !== undefined) {
      next.source.authorId = patch.source.authorId;
    }
  }

  return next;
}

function findPreviewRowByNumber(
  rows: EvaluatedRow[],
  rowNumber: number
): EvaluatedRow | null {
  const row = rows.find((item) => item.row === rowNumber);
  return row || null;
}

function rowToEditableResponse(row: EvaluatedRow) {
  return {
    ...rowToResponse(row),
    editable: row.editable,
  };
}

export const getAdminFoodReviews = async (req: Request, res: Response) => {
  try {
    const page = toPositiveInt(req.query.page, 1, 10000);
    const limit = toPositiveInt(req.query.limit, 20, 200);
    const skip = (page - 1) * limit;

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status : "";

    const filter: Record<string, unknown> = {};

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    if (search.length > 0) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { content: searchRegex },
        { "area.district": searchRegex },
        { dishTags: searchRegex },
        { hashtags: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      FoodReview.find(filter)
        .select("-rawPayload")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FoodReview.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách food review",
      error: error.message,
    });
  }
};

export const getAdminFoodReviewById = async (req: Request, res: Response) => {
  try {
    const item = await FoodReview.findById(req.params.id).select("-rawPayload").lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Food review không tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể tải chi tiết food review",
      error: error.message,
    });
  }
};

export const updateAdminFoodReview = async (req: Request, res: Response) => {
  try {
    const existing = await FoodReview.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Food review không tồn tại",
      });
    }

    const sanitized = sanitizeUpdatePayload(req.body);
    if (!sanitized.update) {
      return res.status(400).json({
        success: false,
        message: sanitized.errors[0] || "Payload cập nhật không hợp lệ",
      });
    }

    if (sanitized.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: sanitized.errors.join("; "),
      });
    }

    if (Object.keys(sanitized.update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có trường hợp lệ để cập nhật",
      });
    }

    const finalPriceMin =
      "priceMin" in sanitized.update
        ? (sanitized.update.priceMin as number | null)
        : existing.priceMin ?? null;
    const finalPriceMax =
      "priceMax" in sanitized.update
        ? (sanitized.update.priceMax as number | null)
        : existing.priceMax ?? null;

    if (
      finalPriceMin !== null &&
      finalPriceMax !== null &&
      finalPriceMin > finalPriceMax
    ) {
      return res.status(400).json({
        success: false,
        message: "priceMin không được lớn hơn priceMax",
      });
    }

    const updated = await FoodReview.findByIdAndUpdate(
      req.params.id,
      { $set: sanitized.update },
      { new: true, runValidators: true }
    )
      .select("-rawPayload")
      .lean();

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Cập nhật food review thành công",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật food review",
      error: error.message,
    });
  }
};

export const previewFoodReviewImport = async (req: Request, res: Response) => {
  try {
    const records = extractRecords(req.body);

    if (!records.length) {
      return res.status(400).json({
        success: false,
        message: "records phải là một mảng JSON không rỗng",
      });
    }

    if (records.length > MAX_IMPORT_ROWS) {
      return res.status(400).json({
        success: false,
        message: `Số lượng record vượt quá giới hạn (${MAX_IMPORT_ROWS})`,
      });
    }

    const evaluated = evaluateImportRows(records);

    return res.status(200).json({
      success: true,
      data: {
        totalRecords: records.length,
        validRecords: evaluated.validRows.length,
        invalidRecords: evaluated.invalidRows.length,
        warningCounts: evaluated.warningCounts,
        previewRows: evaluated.rows.map(rowToResponse),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể preview file import",
      error: error.message,
    });
  }
};

export const previewFoodReviewImportSession = async (
  req: Request,
  res: Response
) => {
  try {
    const records = extractRecords(req.body);

    if (!records.length) {
      return res.status(400).json({
        success: false,
        message: "records phải là một mảng JSON không rỗng",
      });
    }

    if (records.length > MAX_IMPORT_ROWS) {
      return res.status(400).json({
        success: false,
        message: `Số lượng record vượt quá giới hạn (${MAX_IMPORT_ROWS})`,
      });
    }

    const evaluated = evaluateImportRows(records);
    const previewPageSize = toPreviewPageSize(req.query.limit);
    const requestedPage = toPositiveInt(req.query.page, 1, 1_000_000);
    const statusFilter = parsePreviewStatusFilter(req.query.status);

    const session = createPreviewImportSession(records.length, evaluated);
    const summary = buildPreviewSummary(records.length, evaluated);
    const previewPage = buildPreviewPage(
      evaluated.rows,
      requestedPage,
      previewPageSize,
      statusFilter
    );

    return res.status(200).json({
      success: true,
      data: {
        ...summary,
        session: {
          sessionId: session.sessionId,
          expiresAt: new Date(session.expiresAt).toISOString(),
        },
        previewPage,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể tạo preview session",
      error: error.message,
    });
  }
};

export const getFoodReviewImportPreviewSessionPage = async (
  req: Request,
  res: Response
) => {
  try {
    const sessionId =
      typeof req.params.sessionId === "string"
        ? req.params.sessionId.trim()
        : "";

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId không hợp lệ",
      });
    }

    const session = getPreviewImportSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Preview session không tồn tại hoặc đã hết hạn",
      });
    }

    const previewPageSize = toPreviewPageSize(req.query.limit);
    const requestedPage = toPositiveInt(req.query.page, 1, 1_000_000);
    const statusFilter = parsePreviewStatusFilter(req.query.status);
    const summary = buildPreviewSummary(session.recordsCount, session.evaluated);
    const previewPage = buildPreviewPage(
      session.evaluated.rows,
      requestedPage,
      previewPageSize,
      statusFilter
    );

    return res.status(200).json({
      success: true,
      data: {
        ...summary,
        session: {
          sessionId: session.sessionId,
          expiresAt: new Date(session.expiresAt).toISOString(),
        },
        previewPage,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể tải trang preview theo session",
      error: error.message,
    });
  }
};

export const getFoodReviewImportPreviewSessionRow = async (
  req: Request,
  res: Response
) => {
  try {
    const sessionId =
      typeof req.params.sessionId === "string"
        ? req.params.sessionId.trim()
        : "";

    const rowNumber = Number(req.params.rowNumber);

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId không hợp lệ",
      });
    }

    if (!Number.isInteger(rowNumber) || rowNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "rowNumber không hợp lệ",
      });
    }

    const session = getPreviewImportSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Preview session không tồn tại hoặc đã hết hạn",
      });
    }

    const row = findPreviewRowByNumber(session.evaluated.rows, rowNumber);
    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy row trong preview session",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...buildPreviewSummary(session.recordsCount, session.evaluated),
        session: {
          sessionId: session.sessionId,
          expiresAt: new Date(session.expiresAt).toISOString(),
        },
        row: rowToEditableResponse(row),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể tải chi tiết row preview",
      error: error.message,
    });
  }
};

export const updateFoodReviewImportPreviewSessionRow = async (
  req: Request,
  res: Response
) => {
  try {
    const sessionId =
      typeof req.params.sessionId === "string"
        ? req.params.sessionId.trim()
        : "";

    const rowNumber = Number(req.params.rowNumber);

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId không hợp lệ",
      });
    }

    if (!Number.isInteger(rowNumber) || rowNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "rowNumber không hợp lệ",
      });
    }

    const session = getPreviewImportSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Preview session không tồn tại hoặc đã hết hạn",
      });
    }

    const targetRow = findPreviewRowByNumber(session.evaluated.rows, rowNumber);
    if (!targetRow) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy row trong preview session",
      });
    }

    const sanitized = sanitizePreviewEditableDraftPatch(req.body);
    if (!sanitized.patch) {
      return res.status(400).json({
        success: false,
        message: sanitized.errors[0] || "Payload cập nhật preview không hợp lệ",
      });
    }

    if (sanitized.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: sanitized.errors.join("; "),
      });
    }

    targetRow.editable = applyPreviewEditableDraftPatch(
      targetRow.editable,
      sanitized.patch
    );

    session.evaluated = recomputeEvaluatedRows(session.evaluated.rows);

    const updatedRow = findPreviewRowByNumber(session.evaluated.rows, rowNumber);
    if (!updatedRow) {
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật row preview",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...buildPreviewSummary(session.recordsCount, session.evaluated),
        session: {
          sessionId: session.sessionId,
          expiresAt: new Date(session.expiresAt).toISOString(),
        },
        row: rowToEditableResponse(updatedRow),
      },
      message: "Cập nhật row preview thành công",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật row preview",
      error: error.message,
    });
  }
};

export const commitFoodReviewImportSession = async (
  req: Request,
  res: Response
) => {
  try {
    const sessionId =
      typeof req.params.sessionId === "string"
        ? req.params.sessionId.trim()
        : "";

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId không hợp lệ",
      });
    }

    const session = getPreviewImportSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Preview session không tồn tại hoặc đã hết hạn",
      });
    }

    const result = await commitEvaluatedRows(session.recordsCount, session.evaluated);
    previewImportSessions.delete(sessionId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Import food review theo session thất bại",
      error: error.message,
    });
  }
};

export const commitFoodReviewImport = async (req: Request, res: Response) => {
  try {
    const records = extractRecords(req.body);

    if (!records.length) {
      return res.status(400).json({
        success: false,
        message: "records phải là một mảng JSON không rỗng",
      });
    }

    if (records.length > MAX_IMPORT_ROWS) {
      return res.status(400).json({
        success: false,
        message: `Số lượng record vượt quá giới hạn (${MAX_IMPORT_ROWS})`,
      });
    }

    const evaluated = evaluateImportRows(records);
    const result = await commitEvaluatedRows(records.length, evaluated);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Import food review thất bại",
      error: error.message,
    });
  }
};
