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
  location?: string;
  destination_id?: string;
  location_id?: string;
  location_type?: string;
  departure_province_id?: string;
  departure?: string;
  name?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  from?: string;
  to?: string;
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

// Lịch trình tour từng ngày
export interface ItineraryDay {
  day: number; // 0 = đêm đầu, 1 = ngày 1, ...
  title: string;
  description?: string;
  meals: string[]; // ["Ăn Sáng", "Trưa", "Tối"]
  image?: string;
}

// Chi tiết dịch vụ bao gồm
export interface IncludedServicesDetail {
  transport?: string; // Vận chuyển
  accommodation?: string; // Lưu trú
  meals?: string; // Ăn uống
  guide?: string; // Hướng dẫn viên
  extras?: string[]; // Các dịch vụ khác
}

export interface Tour {
  _id: string;
  name: string;
  tour_code?: string; // Mã tour
  description: string; // Điểm nổi bật tour
  country_id?: any; // Quốc gia đích đến
  departure_location_id?: Province | string; // Điểm khởi hành (province)
  adult_price: number;
  child_price: number;
  duration_days: number;
  rating?: number;
  guide_id?: any;
  departure_dates?: string[]; // Các ngày khởi hành
  included_services?: Service[] | string[]; // Dịch vụ bao gồm (ref)
  
  // Các trường chi tiết tour
  itinerary?: ItineraryDay[]; // Chương trình tour từng ngày
  included_services_detail?: IncludedServicesDetail; // Giá Tour Bao Gồm
  excluded_services?: string[]; // Giá Tour Không Bao Gồm
  
  capacity?: number;
  destination?: string;
  status?: "active" | "inactive";
  featured?: boolean;
  is_featured?: boolean;
  max_participants?: number;
  images?: string[];
  banner_url?: string;
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

// Service Types
export interface Service {
  _id: string;
  name: string;
  description?: string;
  category: "meal" | "transport" | "entertainment" | "amenity" | "insurance" | "other";
  icon?: string;
  is_active: boolean;
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
