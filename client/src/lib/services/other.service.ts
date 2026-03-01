import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";

// Airline type
export interface Airline {
  _id: string;
  name: string;
  code: string;
  country: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// Transport type
export interface Transport {
  _id: string;
  name: string;
  type: string;
  capacity: number;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

// Partner type
export interface Partner {
  _id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Guide type
export interface Guide {
  _id: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  experience: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// Review type
export interface Review {
  _id: string;
  user: string;
  tour: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Role type
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// Permission type
export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Conversation type
export interface Conversation {
  _id: string;
  user: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Address type
export interface Address {
  _id: string;
  country_id?: any;
  province_id?: any;
  district_id?: any;
  ward_id?: any;
  address_detail?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Airlines API Service
 */
export const airlinesApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Airline>>("/admin/airlines", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Airline>>(`/admin/airlines/${id}`);
  },

  create: (data: Partial<Airline>) => {
    return apiClient.post<ApiResponse<Airline>>("/admin/airlines", data);
  },

  update: (id: string, data: Partial<Airline>) => {
    return apiClient.put<ApiResponse<Airline>>(`/admin/airlines/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/airlines/${id}`);
  },
};

/**
 * Transports API Service
 */
export const transportsApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Transport>>("/admin/transports", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Transport>>(`/admin/transports/${id}`);
  },

  create: (data: Partial<Transport>) => {
    return apiClient.post<ApiResponse<Transport>>("/admin/transports", data);
  },

  update: (id: string, data: Partial<Transport>) => {
    return apiClient.put<ApiResponse<Transport>>(
      `/admin/transports/${id}`,
      data
    );
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/transports/${id}`);
  },
};

/**
 * Partners API Service
 */
export const partnersApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Partner>>("/client/partners", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Partner>>(`/client/partners/${id}`);
  },

  create: (data: Partial<Partner>) => {
    return apiClient.post<ApiResponse<Partner>>("/admin/partners", data);
  },

  update: (id: string, data: Partial<Partner>) => {
    return apiClient.put<ApiResponse<Partner>>(`/admin/partners/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/partners/${id}`);
  },
};

/**
 * Guides API Service
 */
export const guidesApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Guide>>("/client/guides", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Guide>>(`/client/guides/${id}`);
  },

  create: (data: Partial<Guide>) => {
    return apiClient.post<ApiResponse<Guide>>("/admin/guides", data);
  },

  update: (id: string, data: Partial<Guide>) => {
    return apiClient.put<ApiResponse<Guide>>(`/admin/guides/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/guides/${id}`);
  },
};

/**
 * Reviews API Service
 */
export const reviewsApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Review>>("/admin/reviews", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Review>>(`/admin/reviews/${id}`);
  },

  create: (data: Partial<Review>) => {
    return apiClient.post<ApiResponse<Review>>("/admin/reviews", data);
  },

  update: (id: string, data: Partial<Review>) => {
    return apiClient.put<ApiResponse<Review>>(`/admin/reviews/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/reviews/${id}`);
  },
};

/**
 * Roles API Service
 */
export const rolesApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Role>>("/admin/roles", { // admin only
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Role>>(`/admin/roles/${id}`);
  },

  create: (data: Partial<Role>) => {
    return apiClient.post<ApiResponse<Role>>("/admin/roles", data);
  },

  update: (id: string, data: Partial<Role>) => {
    return apiClient.put<ApiResponse<Role>>(`/admin/roles/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/roles/${id}`);
  },
};

/**
 * Permissions API Service
 */
export const permissionsApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Permission>>("/admin/permissions", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Permission>>(`/admin/permissions/${id}`);
  },

  create: (data: Partial<Permission>) => {
    return apiClient.post<ApiResponse<Permission>>("/admin/permissions", data);
  },

  update: (id: string, data: Partial<Permission>) => {
    return apiClient.put<ApiResponse<Permission>>(
      `/admin/permissions/${id}`,
      data
    );
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/permissions/${id}`);
  },
};

/**
 * Conversations API Service
 */
export const conversationsApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Conversation>>(
      "/admin/conversations",
      {
        params,
      }
    );
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Conversation>>(
      `/admin/conversations/${id}`
    );
  },

  create: (data: Partial<Conversation>) => {
    return apiClient.post<ApiResponse<Conversation>>(
      "/admin/conversations",
      data
    );
  },

  update: (id: string, data: Partial<Conversation>) => {
    return apiClient.put<ApiResponse<Conversation>>(
      `/admin/conversations/${id}`,
      data
    );
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/conversations/${id}`);
  },
};

/**
 * Addresses API Service
 */
export const addressesApi = {
  getAll: (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<Address>>("/admin/addresses", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<Address>>(`/admin/addresses/${id}`);
  },

  create: (data: Partial<Address>) => {
    return apiClient.post<ApiResponse<Address>>("/admin/addresses", data);
  },

  update: (id: string, data: Partial<Address>) => {
    return apiClient.put<ApiResponse<Address>>(`/admin/addresses/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/admin/addresses/${id}`);
  },

  search: (query: string) => {
    return apiClient.get<PaginatedResponse<Address>>("/admin/addresses", {
      params: { search: query, limit: 20 },
    });
  },
};
