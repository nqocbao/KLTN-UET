import { apiClient } from "@/lib/api-client";
import type {
  User,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

/**
 * Users API Service
 */
export const usersApi = {
  // Get all users with pagination
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<User>>("/admin/users", {
      params,
    });
  },

  // Get user by ID
  getById: (id: string) => {
    return apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
  },

  // Create new user
  create: (data: Partial<User>) => {
    return apiClient.post<ApiResponse<User>>("/admin/users", data);
  },

  // Update user
  update: (id: string, data: Partial<User>) => {
    return apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
  },

  // Delete user
  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`);
  },

  // Bulk delete users
  bulkDelete: (ids: string[]) => {
    return apiClient.post<ApiResponse<void>>("/admin/users/bulk-delete", {
      ids,
    });
  },
};
