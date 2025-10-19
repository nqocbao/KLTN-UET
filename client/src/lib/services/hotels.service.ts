import { apiClient } from "@/lib/api-client";
import type {
  Hotel,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

/**
 * Hotels API Service
 */
export const hotelsApi = {
  // Get all hotels with pagination
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Hotel>>("/admin/hotels", {
      params,
    });
  },

  // Get hotel by ID
  getById: (id: string) => {
    return apiClient.get<ApiResponse<Hotel>>(`/admin/hotels/${id}`);
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
