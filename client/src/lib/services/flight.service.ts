import { apiClient } from '../api-client';

export interface Flight {
  _id: string;
  type: 'flight';
  service_name: string;
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
  image: string;
  is_active: boolean;
}

export interface FlightSearchParams {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_high' | 'departure_early' | 'duration_short';
}

export interface FlightSearchResponse {
  success: boolean;
  data: Flight[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class FlightService {
  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      if (params.date) queryParams.append('date', params.date);
      if (params.passengers) queryParams.append('passengers', params.passengers.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);

      const response = await apiClient.get<FlightSearchResponse>(
        `/client/flights?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }

  async getFlightById(id: string): Promise<Flight> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Flight }>(
        `/client/flights/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting flight:', error);
      throw error;
    }
  }
}

export const flightService = new FlightService();
