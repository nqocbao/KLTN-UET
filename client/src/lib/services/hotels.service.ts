import { apiClient } from "@/lib/api-client";
import type {
  Hotel,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

export interface HotelAutocompleteSuggestion {
  id: string;
  name: string;
  type: string;
  location: string | null;
  thumbnail: string | null;
  highlighted_words: string[];
  autocomplete_suggestion: string | null;
  property_token: string | null;
  serpapi_google_hotels_link: string | null;
}

export interface HotelAutocompleteResponse {
  success: boolean;
  data: HotelAutocompleteSuggestion[];
  total: number;
  meta?: {
    query: string;
    source: string;
  };
}

export interface HotelSearchResult {
  id?: string;
  name: string;
  image_url?: string | null;
  rating?: number | null;
  price?: number | null;
  price_text?: string | null;
  hotel_class?: number | null;
  reviews?: number;
  amenities?: string[];
  description?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  } | null;
}

export interface HotelSearchResponse {
  success: boolean;
  data: HotelSearchResult[];
  total: number;
  meta?: {
    query: string;
    check_in_date: string;
    check_out_date: string;
    adults: number;
    children: number;
    source: string;
  };
}

/**
 * Hotels API Service
 */
export const hotelsApi = {
  // Get all hotels with pagination
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Hotel>>("/client/hotels", {
      params,
    });
  },

  // Get hotel by ID
  getById: (id: string) => {
    return apiClient.get<ApiResponse<Hotel>>(`/client/hotels/${id}`);
  },

  // Autocomplete hotel names/places from SerpAPI
  autocomplete: (params: {
    q: string;
    gl?: string;
    hl?: string;
    currency?: string;
    limit?: number;
  }) => {
    return apiClient.get<HotelAutocompleteResponse>("/client/hotels/autocomplete", {
      params,
    });
  },

  // Search hotels from SerpAPI Google Hotels
  search: (params: {
    q: string;
    check_in_date: string;
    check_out_date: string;
    adults?: number;
    children?: number;
    children_ages?: string;
    gl?: string;
    hl?: string;
    currency?: string;
  }) => {
    return apiClient.get<HotelSearchResponse>("/client/hotels/search", {
      params,
    });
  },

  // Create new hotel
  create: (data: Partial<Hotel>) => {
    return apiClient.post<ApiResponse<Hotel>>("/admin/hotels", data);
  },

  // Update hotel
  update: (id: string, data: Partial<Hotel>) => {
    return apiClient.put<ApiResponse<Hotel>>(`/admin/hotels/${id}`, data);
  },

  // Delete hotel
  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/hotels/${id}`);
  },
};
