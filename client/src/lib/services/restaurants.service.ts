import { apiClient } from "@/lib/api-client";
import type {
  Restaurant,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

/**
 * Restaurants API Service
 */
export const restaurantsApi = {
  // Get all restaurants with pagination
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Restaurant>>("/client/restaurants", {
      params,
    });
  },

  // Get restaurant by ID
  getById: (id: string) => {
    return apiClient.get<ApiResponse<Restaurant>>(`/client/restaurants/${id}`);
  },

  // Create new restaurant
  create: (data: Partial<Restaurant>) => {
    return apiClient.post<ApiResponse<Restaurant>>("/admin/restaurants", data);
  },

  // Update restaurant
  update: (id: string, data: Partial<Restaurant>) => {
    return apiClient.put<ApiResponse<Restaurant>>(
      `/admin/restaurants/${id}`,
      data
    );
  },

  // Delete restaurant
  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/restaurants/${id}`);
  },
};
