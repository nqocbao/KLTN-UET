import { apiClient } from "@/lib/api-client";
import type { LoginCredentials, LoginResponse, RegisterData, User } from "@/types/api";

/**
 * Authentication API Service
 */
export const authApi = {
  // Login
  login: (credentials: LoginCredentials) => {
    return apiClient.post<LoginResponse>("/client/auth/login", credentials);
  },

  // Register
  register: (data: RegisterData) => {
    return apiClient.post<LoginResponse>("/client/auth/register", data);
  },

  // Logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.resolve();
  },

  // Get current user (JWT token sent automatically via api-client interceptor)
  getCurrentUser: () => {
    return apiClient.get<{ success: boolean; data: User }>("/client/auth/me");
  },
};
