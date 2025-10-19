import { apiClient } from "@/lib/api-client";
import type {
  Country,
  Province,
  District,
  Ward,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

/**
 * Countries API Service
 */
export const countriesApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Country>>("/admin/countries", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Country>>(`/admin/countries/${id}`);
  },

  create: (data: Partial<Country>) => {
    return apiClient.post<ApiResponse<Country>>("/admin/countries", data);
  },

  update: (id: string, data: Partial<Country>) => {
    return apiClient.put<ApiResponse<Country>>(`/admin/countries/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/countries/${id}`);
  },
};

/**
 * Provinces API Service
 */
export const provincesApi = {
  getAll: (params?: PaginationParams & { countryId?: string }) => {
    return apiClient.get<PaginatedResponse<Province>>("/admin/provinces", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Province>>(`/admin/provinces/${id}`);
  },

  create: (data: Partial<Province>) => {
    return apiClient.post<ApiResponse<Province>>("/admin/provinces", data);
  },

  update: (id: string, data: Partial<Province>) => {
    return apiClient.put<ApiResponse<Province>>(`/admin/provinces/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/provinces/${id}`);
  },
};

/**
 * Districts API Service
 */
export const districtsApi = {
  getAll: (params?: PaginationParams & { provinceId?: string }) => {
    return apiClient.get<PaginatedResponse<District>>("/admin/districts", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<District>>(`/admin/districts/${id}`);
  },

  create: (data: Partial<District>) => {
    return apiClient.post<ApiResponse<District>>("/admin/districts", data);
  },

  update: (id: string, data: Partial<District>) => {
    return apiClient.put<ApiResponse<District>>(`/admin/districts/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/districts/${id}`);
  },
};

/**
 * Wards API Service
 */
export const wardsApi = {
  getAll: (params?: PaginationParams & { districtId?: string }) => {
    return apiClient.get<PaginatedResponse<Ward>>("/admin/wards", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Ward>>(`/admin/wards/${id}`);
  },

  create: (data: Partial<Ward>) => {
    return apiClient.post<ApiResponse<Ward>>("/admin/wards", data);
  },

  update: (id: string, data: Partial<Ward>) => {
    return apiClient.put<ApiResponse<Ward>>(`/admin/wards/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/wards/${id}`);
  },
};
