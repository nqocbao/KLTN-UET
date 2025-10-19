import { apiClient } from "@/lib/api-client";
import type {
  Destination,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

/**
 * Destinations API Service
 */
export const destinationsApi = {
  // Get all destinations with pagination
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Destination>>(
      "/admin/destinations",
      {
        params,
      }
    );
  },

  // Get destination by ID
  getById: (id: string) => {
    return apiClient.get<ApiResponse<Destination>>(
      `/admin/destinations/${id}`
    );
  },

  // Create new destination
  create: (data: Partial<Destination>) => {
    return apiClient.post<ApiResponse<Destination>>(
      "/admin/destinations",
      data
    );
  },

  // Update destination
  update: (id: string, data: Partial<Destination>) => {
    return apiClient.put<ApiResponse<Destination>>(
      `/admin/destinations/${id}`,
      data
    );
  },

  // Delete destination
  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/destinations/${id}`);
  },
};
