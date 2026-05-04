/**
 * SERPAPI Google Flights Service
 *
 * Gọi SerpAPI để lấy dữ liệu chuyến bay thực tế từ Google Flights.
 * Docs: https://serpapi.com/google-flights-api
 *
 * Yêu cầu: SERPAPI_KEY trong file .env
 */

import axios from "axios";
import type { SerpApiFlightResult } from "./serpapi.mapper.js";

const SERPAPI_BASE_URL = "https://serpapi.com/search";

export interface FlightSearchParams {
  departure_id: string; // IATA: "SGN"
  arrival_id: string;   // IATA: "HAN"
  outbound_date: string; // "2026-03-15"
  currency?: string;     // mặc định "VND"
  hl?: string;           // ngôn ngữ, mặc định "vi"
  adults?: number;
  type?: "1" | "2";     // "1" = one-way, "2" = round trip
}

export interface SerpApiResponse {
  search_metadata: { status: string };
  best_flights?: SerpApiFlightResult[];
  other_flights?: SerpApiFlightResult[];
  error?: string;
}

export interface HotelSearchParams {
  q: string;
  check_in_date: string;
  check_out_date: string;
  gl?: string;
  hl?: string;
  currency?: string;
  adults?: number;
  children?: number;
  children_ages?: string;
}

export interface HotelAutocompleteParams {
  q: string;
  gl?: string;
  hl?: string;
  currency?: string;
}

export interface SerpApiHotelProperty {
  name?: string;
  description?: string;
  overall_rating?: number;
  reviews?: number;
  extracted_hotel_class?: number;
  rate_per_night?: {
    lowest?: string;
    extracted_lowest?: number;
  };
  total_rate?: {
    lowest?: string;
    extracted_lowest?: number;
  };
  images?: Array<{
    thumbnail?: string;
    original_image?: string;
  }>;
  amenities?: string[];
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  [key: string]: unknown;
}

export interface SerpApiHotelResponse {
  search_metadata: { status: string };
  properties?: SerpApiHotelProperty[];
  error?: string;
}

export interface SerpApiHotelAutocompleteSuggestion {
  position?: number;
  value?: string;
  type?: string;
  location?: string;
  thumbnail?: string;
  highlighted_words?: string[];
  autocomplete_suggestion?: string;
  kgmid?: string;
  data_cid?: string;
  property_token?: string;
  serpapi_google_hotels_link?: string;
  serpapi_link?: string;
  [key: string]: unknown;
}

export interface SerpApiHotelAutocompleteResponse {
  search_metadata: { status: string };
  suggestions?: SerpApiHotelAutocompleteSuggestion[];
  error?: string;
}

/**
 * Fetch danh sách chuyến bay từ SerpAPI
 * Gộp best_flights + other_flights → trả về tất cả
 */
export async function fetchFlightsFromSerpApi(
  params: FlightSearchParams
): Promise<SerpApiFlightResult[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_KEY chưa được cấu hình trong .env");
  }

  const response = await axios.get<SerpApiResponse>(SERPAPI_BASE_URL, {
    params: {
      engine: "google_flights",
      api_key: apiKey,
      departure_id: params.departure_id,
      arrival_id: params.arrival_id,
      outbound_date: params.outbound_date,
      currency: params.currency ?? "VND",
      hl: params.hl ?? "vi",
      adults: params.adults ?? 1,
      type: params.type ?? "2", // round trip mặc định để SerpAPI trả về đủ data
    },
    timeout: 15000,
  });

  const data = response.data;

  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  if (data.search_metadata?.status !== "Success") {
    throw new Error(
      `SerpAPI search failed: ${data.search_metadata?.status ?? "Unknown"}`
    );
  }

  // Gộp best_flights và other_flights
  const allFlights: SerpApiFlightResult[] = [
    ...(data.best_flights ?? []),
    ...(data.other_flights ?? []),
  ];

  return allFlights;
}

export async function fetchHotelsFromSerpApi(
  params: HotelSearchParams
): Promise<SerpApiHotelProperty[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_KEY chưa được cấu hình trong .env");
  }

  const response = await axios.get<SerpApiHotelResponse>(SERPAPI_BASE_URL, {
    params: {
      engine: "google_hotels",
      api_key: apiKey,
      q: params.q,
      check_in_date: params.check_in_date,
      check_out_date: params.check_out_date,
      gl: params.gl ?? "vn",
      hl: params.hl ?? "vi",
      currency: params.currency ?? "VND",
      adults: params.adults ?? 2,
      children: params.children ?? 0,
      ...(params.children_ages ? { children_ages: params.children_ages } : {}),
    },
    timeout: 15000,
  });

  const data = response.data;

  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  if (data.search_metadata?.status !== "Success") {
    throw new Error(
      `SerpAPI search failed: ${data.search_metadata?.status ?? "Unknown"}`
    );
  }

  return data.properties ?? [];
}

export async function fetchHotelsAutocompleteFromSerpApi(
  params: HotelAutocompleteParams
): Promise<SerpApiHotelAutocompleteSuggestion[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_KEY chưa được cấu hình trong .env");
  }

  const response = await axios.get<SerpApiHotelAutocompleteResponse>(SERPAPI_BASE_URL, {
    params: {
      engine: "google_hotels_autocomplete",
      api_key: apiKey,
      q: params.q,
      gl: params.gl ?? "vn",
      hl: params.hl ?? "vi",
      currency: params.currency ?? "VND",
    },
    timeout: 15000,
  });

  const data = response.data;

  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  if (data.search_metadata?.status !== "Success") {
    throw new Error(
      `SerpAPI search failed: ${data.search_metadata?.status ?? "Unknown"}`
    );
  }

  return data.suggestions ?? [];
}
