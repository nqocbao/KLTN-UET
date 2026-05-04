import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";
import FoodReview, { type IFoodReview } from "../../models/food_reviews.model.js";
import { getFacebookPostInsights } from "../../services/apify-facebook-post.service.js";

function toInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.trunc(parsed);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toStringArray(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

export const foodReviewsController = {
  async getFoodReviews(req: Request, res: Response) {
    try {
      const page = clamp(toInt(req.query.page, 1), 1, 10_000);
      const limit = clamp(toInt(req.query.limit, 12), 1, 50);
      const skip = (page - 1) * limit;

      const area = typeof req.query.area === "string" ? req.query.area.trim() : "";
      const keywordRaw =
        typeof req.query.search === "string"
          ? req.query.search.trim()
          : typeof req.query.q === "string"
            ? req.query.q.trim()
            : "";
      const dishFilters = toStringArray(req.query.dish);
      const minScore = Number(req.query.minScore);

      const andConditions: FilterQuery<IFoodReview>[] = [{ isActive: true }];

      if (area.length > 0) {
        const areaRegex = new RegExp(escapeRegex(area), "i");
        andConditions.push({
          $or: [
            { "area.city": areaRegex },
            { "area.district": areaRegex },
            { "area.ward": areaRegex },
            { "area.addressText": areaRegex },
          ],
        });
      }

      if (keywordRaw.length > 0) {
        const keywordRegex = new RegExp(escapeRegex(keywordRaw), "i");
        andConditions.push({
          $or: [
            { title: keywordRegex },
            { summary: keywordRegex },
            { content: keywordRegex },
            { dishTags: keywordRegex },
            { hashtags: keywordRegex },
          ],
        });
      }

      if (dishFilters.length > 0) {
        const dishRegexes = dishFilters.map((dish) => new RegExp(escapeRegex(dish), "i"));
        andConditions.push({ dishTags: { $in: dishRegexes } });
      }

      if (Number.isFinite(minScore)) {
        andConditions.push({ "engagement.score": { $gte: minScore } });
      }

      let filter: FilterQuery<IFoodReview> = { isActive: true };
      if (andConditions.length > 1) {
        filter = { $and: andConditions };
      }

      const sortBy =
        typeof req.query.sortBy === "string"
          ? req.query.sortBy
          : typeof req.query.sort === "string"
            ? req.query.sort
            : "hot";

      let sort: Record<string, 1 | -1> = {
        "engagement.score": -1,
        postedAt: -1,
      };

      if (sortBy === "latest") {
        sort = { postedAt: -1, "engagement.score": -1 };
      } else if (sortBy === "most_liked") {
        sort = { "engagement.likesCount": -1, postedAt: -1 };
      }

      const [items, total] = await Promise.all([
        FoodReview.find(filter)
          .select("-rawPayload")
          .sort(sort)
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
      console.error("[food_reviews] getFoodReviews error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Không thể tải danh sách food review",
        error: error.message,
      });
    }
  },

  async getTrendingFoodReviews(req: Request, res: Response) {
    try {
      const limit = clamp(toInt(req.query.limit, 8), 1, 20);

      const items = await FoodReview.find({ isActive: true })
        .select("-rawPayload")
        .sort({ "engagement.score": -1, postedAt: -1 })
        .limit(limit)
        .lean();

      return res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      console.error("[food_reviews] getTrendingFoodReviews error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Không thể tải danh sách đang hot",
        error: error.message,
      });
    }
  },

  async getFoodReviewAreas(_req: Request, res: Response) {
    try {
      const groupedAreas = await FoodReview.aggregate([
        {
          $match: {
            isActive: true,
            "area.city": { $nin: [null, "", "Chưa xác định"] },
          },
        },
        {
          $group: {
            _id: {
              city: "$area.city",
              district: { $ifNull: ["$area.district", ""] },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.city": 1, count: -1, "_id.district": 1 } },
      ]);

      const cityMap = new Map<
        string,
        {
          city: string;
          count: number;
          districts: Array<{ name: string; count: number }>;
        }
      >();

      for (const row of groupedAreas) {
        const city = typeof row?._id?.city === "string" ? row._id.city.trim() : "";
        if (!city) {
          continue;
        }

        const district =
          typeof row?._id?.district === "string" ? row._id.district.trim() : "";
        const count = typeof row?.count === "number" ? row.count : 0;

        if (!cityMap.has(city)) {
          cityMap.set(city, {
            city,
            count: 0,
            districts: [],
          });
        }

        const cityEntry = cityMap.get(city);
        if (!cityEntry) {
          continue;
        }

        cityEntry.count += count;

        if (district) {
          cityEntry.districts.push({
            name: district,
            count,
          });
        }
      }

      const areas = Array.from(cityMap.values())
        .map((item) => ({
          ...item,
          districts: item.districts.sort((a, b) => {
            if (b.count !== a.count) {
              return b.count - a.count;
            }
            return a.name.localeCompare(b.name, "vi");
          }),
        }))
        .sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          return a.city.localeCompare(b.city, "vi");
        });

      return res.status(200).json({
        success: true,
        data: areas,
      });
    } catch (error: any) {
      console.error("[food_reviews] getFoodReviewAreas error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Không thể tải danh sách khu vực",
        error: error.message,
      });
    }
  },

  async getFoodReviewById(req: Request, res: Response) {
    try {
      const item = await FoodReview.findOne({
        _id: req.params.id,
        isActive: true,
      })
        .select("-rawPayload")
        .lean();

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
      console.error("[food_reviews] getFoodReviewById error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Không thể tải chi tiết food review",
        error: error.message,
      });
    }
  },

  async getFoodReviewEnrichedDetail(req: Request, res: Response) {
    try {
      const item = await FoodReview.findOne({
        _id: req.params.id,
        isActive: true,
      })
        .select("-rawPayload")
        .lean();

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Food review không tồn tại",
        });
      }

      const fallbackAddress =
        item.area.addressText ||
        [item.area.district, item.area.city].filter((value) => !!value).join(", ") ||
        null;

      const apifyInsights = await getFacebookPostInsights({
        postUrl: item.source.postUrl,
        fallbackAddress,
      });

      const social = {
        likeCount: apifyInsights.social.likeCount ?? item.engagement.likesCount,
        dislikeCount: apifyInsights.social.dislikeCount ?? 0,
        commentCount: apifyInsights.social.commentCount ?? item.engagement.commentsCount,
        shareCount: apifyInsights.social.shareCount ?? item.engagement.sharesCount,
        reactions: apifyInsights.social.reactions,
        source: apifyInsights.apifyAvailable ? "apify" : "fallback",
        warning: apifyInsights.warning,
        fetchedAt: apifyInsights.fetchedAt,
      };

      const location = {
        latitude: apifyInsights.location.latitude,
        longitude: apifyInsights.location.longitude,
        address: apifyInsights.location.address || fallbackAddress,
        source: apifyInsights.location.source,
      };

      return res.status(200).json({
        success: true,
        data: {
          review: item,
          insights: {
            social,
            location,
          },
        },
      });
    } catch (error: any) {
      console.error("[food_reviews] getFoodReviewEnrichedDetail error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Không thể tải chi tiết mở rộng food review",
        error: error.message,
      });
    }
  },
};
