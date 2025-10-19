import { apiClient } from "@/lib/api-client";
import type { LoginCredentials, LoginResponse, RegisterData, User } from "@/types/api";

/**
 * Authentication API Service
 */
export const authApi = {
  // Login
  login: (credentials: LoginCredentials) => {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },

  // Register
  register: (data: RegisterData) => {
    return apiClient.post<LoginResponse>("/auth/register", data);
  },

  // Logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    return Promise.resolve();
  },

  // Get current user
  getCurrentUser: () => {
    return apiClient.get<{ success: boolean; user: User }>("/auth/me");
  },

  // Refresh token
  refreshToken: () => {
    return apiClient.post<{ success: boolean; token: string }>(
      "/auth/refresh"
    );
  },
};
