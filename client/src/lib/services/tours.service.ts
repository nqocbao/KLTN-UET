import { apiClient } from "@/lib/api-client";
import type {
  Tour,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

/**
 * Tours API Service
 */
export const toursApi = {
  // Get all tours with pagination
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Tour>>("/admin/tours", {
      params,
    });
  },

  // Get tour by ID
  getById: (id: string) => {
    return apiClient.get<ApiResponse<Tour>>(`/admin/tours/${id}`);
  },

  // Create new tour
  create: (data: Partial<Tour>) => {
    return apiClient.post<ApiResponse<Tour>>("/admin/tours", data);
  },

  // Update tour
  update: (id: string, data: Partial<Tour>) => {
    return apiClient.put<ApiResponse<Tour>>(`/admin/tours/${id}`, data);
  },

  // Delete tour
  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/tours/${id}`);
  },

  // Toggle tour featured status
  toggleFeatured: (id: string) => {
    return apiClient.patch<ApiResponse<Tour>>(
      `/admin/tours/${id}/featured`,
      {}
    );
  },
};
