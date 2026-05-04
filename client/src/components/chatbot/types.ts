export interface CardItem {
  name: string;
  image_url?: string;
  rating?: number;
  price_text?: string;
  available_rooms?: number;
  duration?: number;
  departure?: string;
  arrival?: string;
  dep_time?: string;
  arr_time?: string;
  duration_text?: string;
  airline?: string;
  stops?: number;
  tour_code?: string;
  description?: string;
  departure_dates?: string[];
  location?: string;
  post_url?: string;
  engagement_score?: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string[];
}

export interface TripPackage {
  destination: string;
  duration_days?: number;
  tours: CardItem[];
  flights: CardItem[];
  hotels: CardItem[];
  itinerary?: ItineraryDay[];
  total_estimate?: string;
}

export interface Message {
  id: string;
  text?: string;
  cards?: { type: string; items: CardItem[] };
  trip_package?: TripPackage;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface ExtractedEntities {
  destination?: string;
  departure?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  budget?: string;
  duration?: number;
  flight_from?: string;
  flight_to?: string;
}
