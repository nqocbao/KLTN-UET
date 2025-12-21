import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/hotels.model.js";
import Address from "../models/addresses.model.js";
import Province from "../models/provinces.model.js";
import District from "../models/districts.model.js";
import Ward from "../models/wards.model.js";

dotenv.config();

const seedDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to database for seeding");

        // Clear existing data
        await Hotel.deleteMany({});
        await Address.deleteMany({});
        
        console.log("🧹 Cleared existing Hotels and Addresses");

        // Create dummy location data (optional, but helps UI)
        // Note: In a real app, you'd seed Provinces/Districts/Wards first. 
        // Here we'll just assume some assume IDs or create minimal entries if needed, 
        // but to keep it simple and robust, we will just create an Address with null refs if refs are strict,
        // or just plain ObjectIds. 
        // However, the Address model schema has refs. Mongoose doesn't strictly enforce ref existence on save 
        // unless you populate.
        
        // Let's create a placeholder Address
        const address1 = await Address.create({
            address_detail: "123 Ly Thuong Kiet",
            postal_code: "10000",
            latitude: 21.028511,
            longitude: 105.804817
        });
        
        const address2 = await Address.create({
            address_detail: "456 Hoang Dieu",
            postal_code: "55000",
            latitude: 16.0544,
            longitude: 108.2022
        });

        // Create Hotels
        const hotels = [
            {
                name: "Melia Hanoi Hotel",
                image_url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/484057813.jpg?k=3f40409745749749557457495745&o=&hp=1",
                location: "44B Ly Thuong Kiet, Hoan Kiem, Hanoi",
                address_id: address1._id,
                description: "Luxurious 5-star hotel in the heart of Hanoi, offering stunning city views and world-class amenities.",
                rating: 4.8,
                rooms: 306,
                availableRooms: 150,
                priceRange: "3,000,000 - 15,000,000 VND",
                priceTwoSingleBed: 3500000,
                priceOneSingleOneDoubleBed: 5500000,
                images: [
                     "https://cf.bstatic.com/xdata/images/hotel/max1024x768/484057813.jpg?k=b4e34927168019d8569805986477&o=&hp=1",
                     "https://cf.bstatic.com/xdata/images/hotel/max1024x768/484057849.jpg?k=490c000000000000000000000000&o=&hp=1"
                ]
            },
            {
                name: "InterContinental Danang",
                image_url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/15923908.jpg?k=0954398759384594&o=&hp=1",
                location: "Son Tra Peninsula, Da Nang",
                address_id: address2._id,
                description: "An award-winning resort nestled in a pristine nature reserve, featuring a private beach and exquisite dining.",
                rating: 5.0,
                rooms: 200,
                availableRooms: 45,
                priceRange: "8,000,000 - 30,000,000 VND",
                priceTwoSingleBed: 8500000,
                priceOneSingleOneDoubleBed: 12500000,
                images: [
                    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/15923908.jpg?k=0954398759384594&o=&hp=1"
                ]
            },
            {
                name: "Novotel Nha Trang",
                image_url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/384759345.jpg?k=0954398759384594&o=&hp=1",
                location: "50 Tran Phu, Nha Trang",
                address_id: address1._id, // Reusing address for simplicity
                description: "Modern beachfront hotel with balcony rooms overlooking the bay.",
                rating: 4.5,
                rooms: 154,
                availableRooms: 120,
                priceRange: "2,000,000 - 5,000,000 VND",
                priceTwoSingleBed: 2200000,
                priceOneSingleOneDoubleBed: 3500000,
                 images: [
                    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/384759345.jpg?k=0954398759384594&o=&hp=1"
                ]
            },
            {
                name: "Rex Hotel Saigon",
                image_url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/249303534.jpg", 
                location: "141 Nguyen Hue, District 1, Ho Chi Minh City",
                address_id: address1._id,
                description: "Historic luxury heritage hotel in the center of bustling Saigon.",
                rating: 4.6,
                rooms: 286,
                availableRooms: 50,
                priceRange: "2,500,000 - 8,000,000 VND",
                priceTwoSingleBed: 2800000,
                priceOneSingleOneDoubleBed: 4200000,
                images: []
            },
             {
                name: "Memory Da Lat",
                image_url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/4985934.jpg",
                location: "24 Hung Vuong, Da Lat",
                address_id: address2._id,
                description: "Vintage vintage villa with cozy rooms and a beautiful garden.",
                rating: 4.2,
                rooms: 15,
                availableRooms: 5,
                priceRange: "500,000 - 1,500,000 VND",
                priceTwoSingleBed: 600000,
                priceOneSingleOneDoubleBed: 900000,
                images: []
            }
        ];

        await Hotel.insertMany(hotels);
        
        console.log(`✅ successfully created ${hotels.length} hotels!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedDatabase();
