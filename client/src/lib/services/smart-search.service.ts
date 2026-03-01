import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

export interface SmartSearchResultItem {
  id: string;
  name: string;
  type: 'tour' | 'destination' | 'province' | 'country';
  description?: string;
  price?: number;
  duration?: number;
  rating?: number;
  image?: string | null;
  country?: string;
  city?: string;
  category?: string;
  destType?: string;
  code?: string;
}

export interface SmartSearchResults {
  tours: SmartSearchResultItem[];
  destinations: SmartSearchResultItem[];
  provinces: SmartSearchResultItem[];
  countries: SmartSearchResultItem[];
}

export interface SmartSearchResponse {
  success: boolean;
  data: SmartSearchResults;
  meta?: {
    query: string;
    totalResults: number;
    breakdown: {
      tours: number;
      destinations: number;
      provinces: number;
      countries: number;
    };
  };
}

/**
 * Smart Search API Service
 */
export const smartSearchApi = {
  search: (query: string, limit?: number) => {
    return apiClient.get<SmartSearchResponse>("/client/search/smart", {
      params: { q: query, limit },
    });
  },
};
