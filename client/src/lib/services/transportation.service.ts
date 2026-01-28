import { apiClient } from '../api-client';

// Transport types
export type TransportType = 'bus' | 'airport_transfer' | 'taxi' | 'train' | 'car_rental';

// Bus search parameters
export interface BusSearchParams {
  from?: string;
  to?: string;
  date?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_high' | 'departure_early' | 'duration_short';
  minPrice?: number;
  maxPrice?: number;
  busType?: string;
  limit?: number;
}

// Bus data interface (legacy - mapped from Transport)
export interface Bus {
  _id?: string;
  type?: TransportType;
  service_name: string;
  company_name?: string; // Alias for service_name
  bus_type?: string; // Alias for vehicle_type
  vehicle_type: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  available_seats: number;
  rating: number;
  total_reviews: number;
  amenities: string[];
  features: string[];
  image?: string;
  is_active: boolean;
}

// Airport transfer search parameters
export interface AirportTransferSearchParams {
  pickup?: string;
  dropoff?: string;
  date?: string;
  time?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_high' | 'duration_short' | 'luxury';
  minPrice?: number;
  maxPrice?: number;
  vehicleType?: string;
  limit?: number;
}

// Airport transfer data interface (legacy - mapped from Transport)
export interface AirportTransfer {
  _id?: string;
  type?: TransportType;
  service_name: string;
  vehicle_type: string;
  pickup_location: string;
  dropoff_location: string;
  price: number;
  duration: string;
  rating: number;
  total_reviews: number;
  features: string[];
  amenities: string[];
  image?: string;
  is_active: boolean;
}

// Generic Transport interface
export interface Transport {
  _id?: string;
  type: TransportType;
  service_name: string;
  
  // Location fields
  departure_location?: string;
  arrival_location?: string;
  pickup_location?: string;
  dropoff_location?: string;
  
  // Time fields
  departure_time?: string;
  arrival_time?: string;
  duration: string;
  
  // Vehicle details
  vehicle_type: string;
  
  // Pricing
  price: number;
  available_seats?: number;
  
  // Rating & Reviews
  rating: number;
  total_reviews: number;
  
  // Features & Amenities
  amenities: string[];
  features: string[];
  
  // Media
  image?: string;
  
  // Status
  is_active: boolean;
}

// Bus service
export const busService = {
  // Get all buses with filters
  async searchBuses(params: BusSearchParams): Promise<{ success: boolean; data: Bus[]; total: number }> {
    return await apiClient.get<{ success: boolean; data: Bus[]; total: number }>('/client/buses', { params });
  },

  // Get bus by ID
  async getBusById(id: string): Promise<{ success: boolean; data: Bus }> {
    return await apiClient.get<{ success: boolean; data: Bus }>(`/client/buses/${id}`);
  },
};

// Airport transfer service
export const airportTransferService = {
  // Get all transfers with filters
  async searchTransfers(params: AirportTransferSearchParams): Promise<{ success: boolean; data: AirportTransfer[]; total: number }> {
    return await apiClient.get<{ success: boolean; data: AirportTransfer[]; total: number }>('/client/airport-transfers', { params });
  },

  // Get transfer by ID
  async getTransferById(id: string): Promise<{ success: boolean; data: AirportTransfer }> {
    return await apiClient.get<{ success: boolean; data: AirportTransfer }>(`/client/airport-transfers/${id}`);
  },
};
