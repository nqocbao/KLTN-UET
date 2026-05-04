import { apiClient } from "@/lib/api-client";
import type { ApiResponse, FoodReview, FoodReviewArea, PaginatedResponse } from "@/types/api";

export type FoodReviewSortMode = "hot" | "latest" | "most_liked";

export interface FoodReviewQueryParams {
  page?: number;
  limit?: number;
  area?: string;
  search?: string;
  dish?: string;
  minScore?: number;
  sortBy?: FoodReviewSortMode;
}

export interface FoodReviewReactionBreakdown {
  like: number;
  love: number;
  care: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface FoodReviewSocialInsights {
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  shareCount: number;
  reactions: FoodReviewReactionBreakdown | null;
  source: "apify" | "fallback";
  warning: string | null;
  fetchedAt: string;
}

export interface FoodReviewLocationInsights {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  source: "apify" | "geocode" | "review" | "unavailable";
}

export interface FoodReviewEnrichedDetail {
  review: FoodReview;
  insights: {
    social: FoodReviewSocialInsights;
    location: FoodReviewLocationInsights;
  };
}

export const foodReviewsApi = {
  getAll: (params?: FoodReviewQueryParams) => {
    return apiClient.get<PaginatedResponse<FoodReview>>("/client/food-reviews", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<FoodReview>>(`/client/food-reviews/${id}`);
  },

  getTrending: (limit = 8) => {
    return apiClient.get<ApiResponse<FoodReview[]>>("/client/food-reviews/trending", {
      params: { limit },
    });
  },

  getAreas: () => {
    return apiClient.get<ApiResponse<FoodReviewArea[]>>("/client/food-reviews/areas");
  },

  getEnrichedDetail: (id: string) => {
    return apiClient.get<ApiResponse<FoodReviewEnrichedDetail>>(
      `/client/food-reviews/${id}/enriched`
    );
  },
};
