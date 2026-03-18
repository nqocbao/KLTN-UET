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
