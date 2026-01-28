import { Schema, model, Document } from "mongoose";

export interface ITransport extends Document {
  _id?: string;
  
  // Common fields for all transport types
  type: "bus" | "airport_transfer" | "taxi" | "train" | "car_rental" | "flight";
  service_name: string;
  
  // Location fields
  departure_location?: string; // For buses, trains
  arrival_location?: string;   // For buses, trains
  pickup_location?: string;    // For airport transfers, taxis
  dropoff_location?: string;   // For airport transfers, taxis
  
  // Time fields
  departure_time?: string;
  arrival_time?: string;
  duration: string;
  
  // Vehicle details
  vehicle_type: string; // "Giường nằm", "Sedan 4 chỗ", etc.
  
  // Pricing
  price: number;
  available_seats?: number;
  
  // Rating & Reviews
  rating: number;
  total_reviews: number;
  
  // Features & Amenities
  amenities: string[]; // For buses: WiFi, Điều hòa, etc.
  features: string[];  // For airport transfers: Driver chuyên nghiệp, etc.
  
  // Media
  image?: string;
  
  // Status
  is_active: boolean;
  
  // Partner reference (optional)
  partner_id?: Schema.Types.ObjectId;
  
  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}

const TransportSchema = new Schema<ITransport>(
  {
    type: {
      type: String,
      required: true,
      enum: ["bus", "airport_transfer", "taxi", "train", "car_rental", "flight"],
      index: true,
    },
    service_name: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Location fields
    departure_location: {
      type: String,
      trim: true,
    },
    arrival_location: {
      type: String,
      trim: true,
    },
    pickup_location: {
      type: String,
      trim: true,
    },
    dropoff_location: {
      type: String,
      trim: true,
    },
    
    // Time fields
    departure_time: {
      type: String,
    },
    arrival_time: {
      type: String,
    },
    duration: {
      type: String,
      required: true,
    },
    
    // Vehicle details
    vehicle_type: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    available_seats: {
      type: Number,
      min: 0,
    },
    
    // Rating & Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    total_reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Features & Amenities
    amenities: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    
    // Media
    image: {
      type: String,
      default: null,
    },
    
    // Status
    is_active: {
      type: Boolean,
      default: true,
    },
    
    // Partner reference (optional)
    partner_id: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound indexes for efficient searching
TransportSchema.index({ type: 1, departure_location: 1, arrival_location: 1 });
TransportSchema.index({ type: 1, pickup_location: 1, dropoff_location: 1 });
TransportSchema.index({ type: 1, price: 1 });
TransportSchema.index({ type: 1, rating: -1 });
TransportSchema.index({ service_name: "text" });

export const Transport = model<ITransport>("Transport", TransportSchema);
export default Transport;
