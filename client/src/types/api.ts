/**
 * API Response Types
 */

// Common response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  address_id?: any;
  createdAt: string;
  updatedAt: string;
}

// Tour Types
export interface Tour {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  capacity: number;
  destination: string;
  status: "active" | "inactive";
  featured: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Destination Types
export interface Destination {
  _id: string;
  name: string;
  country: string;
  description: string;
  image?: string;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

// Hotel Types
export interface Hotel {
  _id: string;
  name: string;
  image_url?: string;
  location: string;
  address_id?: any; // Populated Address or string ID
  rating: number;
  rooms: number;
  availableRooms: number;
  priceRange: string;
  priceTwoSingleBed?: number;
  priceOneSingleOneDoubleBed?: number;
  description?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Restaurant Types
export interface Restaurant {
  _id: string;
  name: string;
  image_url?: string;
  cuisine: string;
  rating: number;
  priceLevel: number;
  location: string;
  address_id?: any; // Populated Address or string ID
  description?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Country Types
export interface Country {
  _id: string;
  name: string;
  code: string;
  continent: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// Province Types
export interface Province {
  _id: string;
  name: string;
  code: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

// District Types
export interface District {
  _id: string;
  name: string;
  code: string;
  province: string;
  createdAt: string;
  updatedAt: string;
}

// Ward Types
export interface Ward {
  _id: string;
  name: string;
  code: string;
  district: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}
