import { Transport } from '../models/transports.model.js';
import Destination from '../models/destinations.model.js';

// Airport destinations data
export const airportDestinationsData = [
  {
    name: "Sân bay Tân Sơn Nhất",
    code: "SGN",
    description: "Sân bay quốc tế lớn nhất Việt Nam tại TP.HCM",
    country: "Việt Nam",
    city: "TP. Hồ Chí Minh",
    type: "airport",
    rating: 4.5,
    image_url: "/images/airports/sgn.jpg",
  },
  {
    name: "Sân bay Nội Bài",
    code: "HAN",
    description: "Sân bay quốc tế Nội Bài, Hà Nội",
    country: "Việt Nam",
    city: "Hà Nội",
    type: "airport",
    rating: 4.6,
    image_url: "/images/airports/han.jpg",
  },
  {
    name: "Sân bay Đà Nẵng",
    code: "DAD",
    description: "Sân bay quốc tế Đà Nẵng",
    country: "Việt Nam",
    city: "Đà Nẵng",
    type: "airport",
    rating: 4.7,
    image_url: "/images/airports/dad.jpg",
  },
  {
    name: "Sân bay Cam Ranh",
    code: "CXR",
    description: "Sân bay quốc tế Cam Ranh, Khánh Hòa",
    country: "Việt Nam",
    city: "Nha Trang",
    type: "airport",
    rating: 4.5,
    image_url: "/images/airports/cxr.jpg",
  },
  {
    name: "Sân bay Phú Quốc",
    code: "PQC",
    description: "Sân bay quốc tế Phú Quốc",
    country: "Việt Nam",
    city: "Phú Quốc",
    type: "airport",
    rating: 4.8,
    image_url: "/images/airports/pqc.jpg",
  },
  {
    name: "Sân bay Cát Bi",
    code: "HPH",
    description: "Sân bay quốc tế Cát Bi, Hải Phòng",
    country: "Việt Nam",
    city: "Hải Phòng",
    type: "airport",
    rating: 4.3,
    image_url: "/images/airports/hph.jpg",
  },
  {
    name: "Sân bay Liên Khương",
    code: "DLI",
    description: "Sân bay Liên Khương, Đà Lạt",
    country: "Việt Nam",
    city: "Đà Lạt",
    type: "airport",
    rating: 4.4,
    image_url: "/images/airports/dli.jpg",
  },
  {
    name: "Sân bay Vinh",
    code: "VII",
    description: "Sân bay quốc tế Vinh, Nghệ An",
    country: "Việt Nam",
    city: "Vinh",
    type: "airport",
    rating: 4.2,
    image_url: "/images/airports/vii.jpg",
  },
];

// Flight data
export const flightsData = [
  // SGN -> HAN
  {
    type: "flight",
    service_name: "Vietnam Airlines",
    vehicle_type: "Airbus A321",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Nội Bài (HAN)",
    departure_time: "06:00",
    arrival_time: "08:15",
    duration: "2h 15m",
    price: 1850000,
    available_seats: 45,
    rating: 4.7,
    total_reviews: 5430,
    amenities: ["WiFi", "Bữa ăn nhẹ", "Giải trí", "Hành lý 23kg"],
    features: [],
    image: "/images/airlines/vna.jpg",
    is_active: true,
  },
  {
    type: "flight",
    service_name: "VietJet Air",
    vehicle_type: "Airbus A320",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Nội Bài (HAN)",
    departure_time: "07:30",
    arrival_time: "09:40",
    duration: "2h 10m",
    price: 1450000,
    available_seats: 38,
    rating: 4.4,
    total_reviews: 3890,
    amenities: ["Hành lý 7kg"],
    features: [],
    image: "/images/airlines/vietjet.jpg",
    is_active: true,
  },
  {
    type: "flight",
    service_name: "Bamboo Airways",
    vehicle_type: "Embraer E195",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Nội Bài (HAN)",
    departure_time: "09:00",
    arrival_time: "11:15",
    duration: "2h 15m",
    price: 1650000,
    available_seats: 52,
    rating: 4.6,
    total_reviews: 2340,
    amenities: ["WiFi", "Bữa ăn", "Hành lý 20kg"],
    features: [],
    image: "/images/airlines/bamboo.jpg",
    is_active: true,
  },

  // SGN -> DAD
  {
    type: "flight",
    service_name: "Vietnam Airlines",
    vehicle_type: "Airbus A321",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Đà Nẵng (DAD)",
    departure_time: "08:00",
    arrival_time: "09:20",
    duration: "1h 20m",
    price: 1250000,
    available_seats: 28,
    rating: 4.8,
    total_reviews: 4120,
    amenities: ["WiFi", "Bữa ăn nhẹ", "Hành lý 23kg"],
    features: [],
    image: "/images/airlines/vna.jpg",
    is_active: true,
  },
  {
    type: "flight",
    service_name: "VietJet Air",
    vehicle_type: "Airbus A320",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Đà Nẵng (DAD)",
    departure_time: "10:30",
    arrival_time: "11:45",
    duration: "1h 15m",
    price: 950000,
    available_seats: 42,
    rating: 4.3,
    total_reviews: 2890,
    amenities: ["Hành lý 7kg"],
    features: [],
    image: "/images/airlines/vietjet.jpg",
    is_active: true,
  },

  // HAN -> SGN
  {
    type: "flight",
    service_name: "Vietnam Airlines",
    vehicle_type: "Boeing 787",
    departure_location: "Sân bay Nội Bài (HAN)",
    arrival_location: "Sân bay Tân Sơn Nhất (SGN)",
    departure_time: "14:00",
    arrival_time: "16:15",
    duration: "2h 15m",
    price: 1900000,
    available_seats: 68,
    rating: 4.9,
    total_reviews: 6780,
    amenities: ["WiFi", "Bữa ăn", "Giải trí", "Hành lý 30kg"],
    features: [],
    image: "/images/airlines/vna.jpg",
    is_active: true,
  },
  {
    type: "flight",
    service_name: "Bamboo Airways",
    vehicle_type: "Airbus A321neo",
    departure_location: "Sân bay Nội Bài (HAN)",
    arrival_location: "Sân bay Tân Sơn Nhất (SGN)",
    departure_time: "16:30",
    arrival_time: "18:40",
    duration: "2h 10m",
    price: 1680000,
    available_seats: 45,
    rating: 4.7,
    total_reviews: 3450,
    amenities: ["WiFi", "Bữa ăn", "Hành lý 20kg"],
    features: [],
    image: "/images/airlines/bamboo.jpg",
    is_active: true,
  },

  // HAN -> DAD
  {
    type: "flight",
    service_name: "VietJet Air",
    vehicle_type: "Airbus A321",
    departure_location: "Sân bay Nội Bài (HAN)",
    arrival_location: "Sân bay Đà Nẵng (DAD)",
    departure_time: "11:00",
    arrival_time: "12:25",
    duration: "1h 25m",
    price: 1150000,
    available_seats: 35,
    rating: 4.5,
    total_reviews: 2670,
    amenities: ["Hành lý 7kg"],
    features: [],
    image: "/images/airlines/vietjet.jpg",
    is_active: true,
  },

  // SGN -> PQC
  {
    type: "flight",
    service_name: "Vietnam Airlines",
    vehicle_type: "Airbus A321",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Phú Quốc (PQC)",
    departure_time: "09:30",
    arrival_time: "10:30",
    duration: "1h",
    price: 1350000,
    available_seats: 32,
    rating: 4.8,
    total_reviews: 3890,
    amenities: ["WiFi", "Bữa ăn nhẹ", "Hành lý 23kg"],
    features: [],
    image: "/images/airlines/vna.jpg",
    is_active: true,
  },
  {
    type: "flight",
    service_name: "Bamboo Airways",
    vehicle_type: "Airbus A320",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Phú Quốc (PQC)",
    departure_time: "13:00",
    arrival_time: "14:00",
    duration: "1h",
    price: 1280000,
    available_seats: 48,
    rating: 4.6,
    total_reviews: 2340,
    amenities: ["WiFi", "Hành lý 20kg"],
    features: [],
    image: "/images/airlines/bamboo.jpg",
    is_active: true,
  },

  // SGN -> CXR (Nha Trang)
  {
    type: "flight",
    service_name: "VietJet Air",
    vehicle_type: "Airbus A320",
    departure_location: "Sân bay Tân Sơn Nhất (SGN)",
    arrival_location: "Sân bay Cam Ranh (CXR)",
    departure_time: "07:00",
    arrival_time: "08:05",
    duration: "1h 5m",
    price: 850000,
    available_seats: 55,
    rating: 4.4,
    total_reviews: 1890,
    amenities: ["Hành lý 7kg"],
    features: [],
    image: "/images/airlines/vietjet.jpg",
    is_active: true,
  },

  // HAN -> PQC
  {
    type: "flight",
    service_name: "Vietnam Airlines",
    vehicle_type: "Airbus A321",
    departure_location: "Sân bay Nội Bài (HAN)",
    arrival_location: "Sân bay Phú Quốc (PQC)",
    departure_time: "10:00",
    arrival_time: "12:30",
    duration: "2h 30m",
    price: 2150000,
    available_seats: 38,
    rating: 4.7,
    total_reviews: 2560,
    amenities: ["WiFi", "Bữa ăn", "Hành lý 23kg"],
    features: [],
    image: "/images/airlines/vna.jpg",
    is_active: true,
  },
];

export async function seedAirportsAndFlights() {
  try {
    // Seed airport destinations
    for (const airportData of airportDestinationsData) {
      const existing = await Destination.findOne({ code: airportData.code });
      if (!existing) {
        await Destination.create(airportData);
        console.log(`✈️  Created airport: ${airportData.name} (${airportData.code})`);
      } else {
        console.log(`⏭️  Airport exists: ${airportData.name} (${airportData.code})`);
      }
    }

    // Clear existing flights
    await Transport.deleteMany({ type: 'flight' });
    console.log('Cleared existing flights');

    // Insert flights
    const flights = await Transport.insertMany(flightsData);
    console.log(`✅ Seeded ${flights.length} flights successfully`);

    return { airports: airportDestinationsData.length, flights: flights.length };
  } catch (error) {
    console.error('Error seeding airports and flights:', error);
    throw error;
  }
}
