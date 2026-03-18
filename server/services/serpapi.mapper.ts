/**
 * SERPAPI → ITransport Mapper
 *
 * Transform raw Google Flights data từ SerpAPI
 * thành cấu trúc phù hợp với Transport model.
 */

export interface SerpApiFlightLeg {
  airline: string;
  airline_logo?: string;
  airplane?: string;
  departure_airport: {
    name: string;
    id: string;   // IATA code: "SGN", "HAN", ...
    time: string; // "2026-03-15 06:00"
  };
  arrival_airport: {
    name: string;
    id: string;
    time: string;
  };
  duration: number;        // phút, VD: 135
  extensions?: string[];   // ["WiFi", "In-seat power outlet", ...]
  overnight?: boolean;
  often_delayed_by_over_30_min?: boolean;
}

export interface SerpApiFlightResult {
  flights: SerpApiFlightLeg[];
  layovers?: unknown[];
  total_duration: number;
  price: number;
  type?: string;           // "Round trip" | "One way"
  airline_logo?: string;
  extensions?: string[];
  departure_token?: string;
}

export interface MappedFlight {
  type: "flight";
  service_name: string;
  vehicle_type: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;   // "06:00"
  arrival_time: string;     // "08:15"
  duration: string;          // "2h 15m"
  price: number;
  stops: number;
  flight_date: Date;
  fetched_at: Date;
  amenities: string[];
  features: string[];
  image: string;
  available_seats: number;
  is_active: boolean;
}

/**
 * Convert số phút → "2h 15m"
 */
function minutesToDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Parse "2026-03-15 06:00" → { date: Date, time: "06:00" }
 */
function parseDateTime(datetimeStr: string): { date: Date; time: string } {
  // Format từ SerpAPI: "2026-03-15 06:00"
  const parts = datetimeStr.split(" ");
  const datePart = parts[0]; // "2026-03-15"
  const timePart = parts[1] || "00:00"; // "06:00"
  return {
    date: new Date(`${datePart}T00:00:00.000Z`),
    time: timePart,
  };
}

/**
 * Format tên sân bay + mã IATA
 * VD: "Tan Son Nhat Airport" + "SGN" → "Tan Son Nhat Airport (SGN)"
 */
function formatLocation(name: string, iata: string): string {
  return `${name} (${iata})`;
}

/**
 * Map một SerpApi flight result → MappedFlight
 *
 * SerpAPI có thể trả về chuyến bay 1 chặng hoặc nhiều chặng (layover).
 * - departure_location lấy từ chặng đầu tiên
 * - arrival_location lấy từ chặng cuối cùng
 * - service_name lấy từ hãng bay chặng đầu
 * - stops = số chặng - 1
 */
export function mapSerpApiToTransport(
  result: SerpApiFlightResult,
  searchDate: string // "2026-03-15" — date từ search params
): MappedFlight {
  const legs = result.flights;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  const { time: departureTime } = parseDateTime(firstLeg.departure_airport.time);
  const { time: arrivalTime } = parseDateTime(lastLeg.arrival_airport.time);

  // Lấy danh sách hãng bay (nếu nhiều chặng, có thể nhiều hãng)
  const airlines = [...new Set(legs.map((l) => l.airline))];
  const serviceName = airlines.join(" / ");

  // Vehicle type: ưu tiên chặng đầu
  const vehicleType = firstLeg.airplane || "Unknown Aircraft";

  // Amenities: gộp từ result.extensions (summary) hoặc leg.extensions
  const amenities: string[] = result.extensions ?? firstLeg.extensions ?? [];

  return {
    type: "flight",
    service_name: serviceName,
    vehicle_type: vehicleType,
    departure_location: formatLocation(
      firstLeg.departure_airport.name,
      firstLeg.departure_airport.id
    ),
    arrival_location: formatLocation(
      lastLeg.arrival_airport.name,
      lastLeg.arrival_airport.id
    ),
    departure_time: departureTime,
    arrival_time: arrivalTime,
    duration: minutesToDuration(result.total_duration),
    price: result.price,
    stops: legs.length - 1,
    flight_date: new Date(`${searchDate}T00:00:00.000Z`),
    fetched_at: new Date(),
    amenities,
    features: [],
    image: result.airline_logo ?? firstLeg.airline_logo ?? "",
    available_seats: 50, // SerpAPI không trả về, để default
    is_active: true,
  };
}

/**
 * Map toàn bộ SerpAPI response array
 */
export function mapSerpApiResults(
  results: SerpApiFlightResult[],
  searchDate: string
): MappedFlight[] {
  return results
    .filter((r) => r.flights && r.flights.length > 0 && r.price > 0)
    .map((r) => mapSerpApiToTransport(r, searchDate));
}
