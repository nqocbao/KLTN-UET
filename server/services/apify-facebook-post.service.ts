import { ApifyClient } from "apify-client";

const APIFY_FACEBOOK_ACTOR_ID = "apify/facebook-posts-scraper";
const INSIGHT_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_INSIGHT_CACHE_ITEMS = 300;

type RecordValue = Record<string, unknown>;

interface ReactionBreakdown {
  like: number;
  love: number;
  care: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

interface InsightSocial {
  likeCount: number | null;
  dislikeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
  reactions: ReactionBreakdown | null;
}

type LocationSource = "apify" | "geocode" | "review" | "unavailable";

interface InsightLocation {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  source: LocationSource;
}

export interface FacebookPostInsightResult {
  apifyAvailable: boolean;
  warning: string | null;
  fetchedAt: string;
  social: InsightSocial;
  location: InsightLocation;
}

interface InsightCacheValue {
  expiresAt: number;
  data: FacebookPostInsightResult;
}

const insightCache = new Map<string, InsightCacheValue>();

function isRecord(value: unknown): value is RecordValue {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9+\-.,]/g, "").replace(",", ".").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getPathValue(source: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = source;

  for (const part of parts) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

function getFirstNumber(source: unknown, paths: string[]): number | null {
  for (const path of paths) {
    const parsed = toFiniteNumber(getPathValue(source, path));
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
}

function getFirstString(source: unknown, paths: string[]): string | null {
  for (const path of paths) {
    const parsed = toTrimmedString(getPathValue(source, path));
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

function normalizeReactionKey(rawKey: string): keyof ReactionBreakdown | null {
  const key = rawKey.toLowerCase().replace(/[^a-z]/g, "");

  if (key.includes("love")) return "love";
  if (key.includes("care")) return "care";
  if (key.includes("haha") || key.includes("laugh")) return "haha";
  if (key.includes("wow")) return "wow";
  if (key.includes("sad")) return "sad";
  if (key.includes("angry") || key.includes("mad")) return "angry";
  if (key.includes("like") || key === "thumbsup") return "like";

  return null;
}

function buildEmptyReactionBreakdown(): ReactionBreakdown {
  return {
    like: 0,
    love: 0,
    care: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };
}

function parseReactionBreakdown(source: unknown): ReactionBreakdown | null {
  const candidates = [
    getPathValue(source, "reactions"),
    getPathValue(source, "reactionStats"),
    getPathValue(source, "reactionsCountByType"),
    getPathValue(source, "stats.reactions"),
  ];

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      const breakdown = buildEmptyReactionBreakdown();
      let hasAny = false;

      for (const [key, rawValue] of Object.entries(candidate)) {
        const normalizedKey = normalizeReactionKey(key);
        const count = toFiniteNumber(rawValue);
        if (!normalizedKey || count === null) continue;
        breakdown[normalizedKey] += Math.max(0, count);
        hasAny = true;
      }

      if (hasAny) return breakdown;
    }

    if (Array.isArray(candidate)) {
      const breakdown = buildEmptyReactionBreakdown();
      let hasAny = false;

      for (const item of candidate) {
        if (!isRecord(item)) continue;

        const rawType =
          toTrimmedString(item.type) ||
          toTrimmedString(item.reaction) ||
          toTrimmedString(item.name);
        const count =
          toFiniteNumber(item.count) ||
          toFiniteNumber(item.value) ||
          toFiniteNumber(item.total);

        if (!rawType || count === null) continue;

        const normalizedKey = normalizeReactionKey(rawType);
        if (!normalizedKey) continue;

        breakdown[normalizedKey] += Math.max(0, count);
        hasAny = true;
      }

      if (hasAny) return breakdown;
    }
  }

  return null;
}

function parseLocationFromScrapedItem(item: unknown): InsightLocation {
  const latitude = getFirstNumber(item, [
    "latitude",
    "lat",
    "location.latitude",
    "location.lat",
    "coordinates.latitude",
    "coordinates.lat",
    "geo.latitude",
    "geo.lat",
  ]);

  const longitude = getFirstNumber(item, [
    "longitude",
    "lng",
    "long",
    "location.longitude",
    "location.lng",
    "coordinates.longitude",
    "coordinates.lng",
    "geo.longitude",
    "geo.lng",
  ]);

  const address = getFirstString(item, [
    "address",
    "location.address",
    "place.address",
    "locationName",
    "location.name",
    "location.fullAddress",
  ]);

  if (latitude !== null && longitude !== null) {
    return {
      latitude,
      longitude,
      address,
      source: "apify",
    };
  }

  return {
    latitude: null,
    longitude: null,
    address,
    source: address ? "review" : "unavailable",
  };
}

function parseSocialFromScrapedItem(item: unknown): InsightSocial {
  const reactions = parseReactionBreakdown(item);

  const likeCount =
    getFirstNumber(item, ["likeCount", "likesCount", "likes", "engagement.likesCount"]) ??
    (reactions ? reactions.like : null);

  const dislikeCount =
    getFirstNumber(item, ["dislikeCount", "dislikes", "negativeReactions"]) ??
    (reactions ? reactions.sad + reactions.angry : null);

  const commentCount = getFirstNumber(item, [
    "commentCount",
    "commentsCount",
    "comments",
    "engagement.commentsCount",
  ]);

  const shareCount = getFirstNumber(item, [
    "shareCount",
    "sharesCount",
    "shares",
    "engagement.sharesCount",
  ]);

  return {
    likeCount,
    dislikeCount,
    commentCount,
    shareCount,
    reactions,
  };
}

function pruneInsightCache(): void {
  const now = Date.now();

  for (const [key, cacheValue] of insightCache.entries()) {
    if (cacheValue.expiresAt <= now) {
      insightCache.delete(key);
    }
  }

  if (insightCache.size <= MAX_INSIGHT_CACHE_ITEMS) {
    return;
  }

  const sortedKeys = Array.from(insightCache.entries())
    .sort((a, b) => a[1].expiresAt - b[1].expiresAt)
    .map((entry) => entry[0]);

  const itemsToDelete = insightCache.size - MAX_INSIGHT_CACHE_ITEMS;
  for (let i = 0; i < itemsToDelete; i += 1) {
    const key = sortedKeys[i];
    if (key) insightCache.delete(key);
  }
}

async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    address
  )}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "kltn-uet-foodtour/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const first = data[0];
    if (!isRecord(first)) {
      return null;
    }

    const latitude = toFiniteNumber(first.lat);
    const longitude = toFiniteNumber(first.lon);
    if (latitude === null || longitude === null) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
}

async function fetchFirstScrapedItem(postUrl: string): Promise<{ item: RecordValue | null; warning: string | null; apifyAvailable: boolean }> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) {
    return {
      item: null,
      warning: "APIFY_TOKEN chưa được cấu hình",
      apifyAvailable: false,
    };
  }

  try {
    const client = new ApifyClient({ token });
    const run = await client.actor(APIFY_FACEBOOK_ACTOR_ID).call({
      startUrls: [{ url: postUrl }],
      maxItems: 1,
    });

    const datasetId = run.defaultDatasetId;
    if (!datasetId) {
      return {
        item: null,
        warning: "Apify run không trả về dataset",
        apifyAvailable: true,
      };
    }

    const dataset = await client.dataset(datasetId).listItems({ limit: 1, clean: true });
    const firstItem = dataset.items[0];

    if (!isRecord(firstItem)) {
      return {
        item: null,
        warning: "Không có dữ liệu post từ Apify",
        apifyAvailable: true,
      };
    }

    return {
      item: firstItem,
      warning: null,
      apifyAvailable: true,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định từ Apify";
    return {
      item: null,
      warning: message,
      apifyAvailable: true,
    };
  }
}

export async function getFacebookPostInsights(input: {
  postUrl: string;
  fallbackAddress?: string | null;
  forceRefresh?: boolean;
}): Promise<FacebookPostInsightResult> {
  const postUrl = input.postUrl.trim();
  const fallbackAddress = input.fallbackAddress?.trim() || null;
  const forceRefresh = input.forceRefresh === true;

  if (!postUrl) {
    return {
      apifyAvailable: false,
      warning: "postUrl không hợp lệ",
      fetchedAt: new Date().toISOString(),
      social: {
        likeCount: null,
        dislikeCount: null,
        commentCount: null,
        shareCount: null,
        reactions: null,
      },
      location: {
        latitude: null,
        longitude: null,
        address: fallbackAddress,
        source: fallbackAddress ? "review" : "unavailable",
      },
    };
  }

  if (!forceRefresh) {
    pruneInsightCache();
    const cached = insightCache.get(postUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  const scraped = await fetchFirstScrapedItem(postUrl);

  const social = scraped.item ? parseSocialFromScrapedItem(scraped.item) : {
    likeCount: null,
    dislikeCount: null,
    commentCount: null,
    shareCount: null,
    reactions: null,
  };

  const baseLocation = scraped.item
    ? parseLocationFromScrapedItem(scraped.item)
    : {
        latitude: null,
        longitude: null,
        address: null,
        source: "unavailable" as const,
      };

  let location = baseLocation;
  const resolvedAddress = location.address || fallbackAddress;

  if (location.latitude === null && location.longitude === null && resolvedAddress) {
    const geocoded = await geocodeAddress(resolvedAddress);
    if (geocoded) {
      location = {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        address: resolvedAddress,
        source: "geocode",
      };
    } else {
      location = {
        latitude: null,
        longitude: null,
        address: resolvedAddress,
        source: "review",
      };
    }
  } else if (resolvedAddress && !location.address) {
    location = {
      ...location,
      address: resolvedAddress,
      source: "review",
    };
  }

  const result: FacebookPostInsightResult = {
    apifyAvailable: scraped.apifyAvailable,
    warning: scraped.warning,
    fetchedAt: new Date().toISOString(),
    social,
    location,
  };

  insightCache.set(postUrl, {
    expiresAt: Date.now() + INSIGHT_CACHE_TTL_MS,
    data: result,
  });

  pruneInsightCache();
  return result;
}