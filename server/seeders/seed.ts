import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/hotels.model.js";
import Address from "../models/addresses.model.js";
import Destination from "../models/destinations.model.js";
import Country from "../models/countries.model.js";
import Province from "../models/provinces.model.js";
import District from "../models/districts.model.js";
import Ward from "../models/wards.model.js";
import Tour from "../models/tours.model.js";
import Guide from "../models/guides.model.js";
import User from "../models/users.model.js";
import Service from "../models/services.model.js";
import { seedTransports } from "./transports.seed.js";
import { seedAirportsAndFlights } from "./flights.seed.js";

dotenv.config();

const seedDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to database for seeding");

        // Clear existing data (Commented out to prevent accidental deletion)
        // await Hotel.deleteMany({});
        // await Address.deleteMany({});
        // await Country.deleteMany({});
        // await Province.deleteMany({});
        // await District.deleteMany({});
        // await Ward.deleteMany({});
        
        // console.log("🧹 Cleared existing data");

        // 1. Find or Create Country
        let vietnam = await Country.findOne({ name: "Việt Nam" });
        if (!vietnam) {
            vietnam = await Country.create({
                name: "Việt Nam",
                code: "VN",
                description: "Beautiful country in Southeast Asia",
                flag_url: "https://flagcdn.com/w320/vn.png"
            });
        }

        // Create international countries for tours
        const countriesData = [
            { name: "Thái Lan", code: "TH", description: "Land of Smiles - Xứ sở chùa vàng", flag_url: "https://flagcdn.com/w320/th.png" },
            { name: "Nhật Bản", code: "JP", description: "Land of the Rising Sun - Xứ sở hoa anh đào", flag_url: "https://flagcdn.com/w320/jp.png" },
            { name: "Hàn Quốc", code: "KR", description: "Land of Morning Calm - Xứ sở Kim Chi", flag_url: "https://flagcdn.com/w320/kr.png" },
            { name: "Singapore", code: "SG", description: "Lion City - Đảo quốc sư tử", flag_url: "https://flagcdn.com/w320/sg.png" },
            { name: "Trung Quốc", code: "CN", description: "Middle Kingdom - Đất nước tỷ dân", flag_url: "https://flagcdn.com/w320/cn.png" },
            { name: "Malaysia", code: "MY", description: "Truly Asia - Châu Á thực thụ", flag_url: "https://flagcdn.com/w320/my.png" },
            { name: "Indonesia", code: "ID", description: "Wonderful Indonesia - Quần đảo vạn hương", flag_url: "https://flagcdn.com/w320/id.png" },
            { name: "UAE", code: "AE", description: "United Arab Emirates - Tiểu vương quốc Ả Rập", flag_url: "https://flagcdn.com/w320/ae.png" },
            { name: "Pháp", code: "FR", description: "La France - Kinh đô ánh sáng", flag_url: "https://flagcdn.com/w320/fr.png" },
            { name: "Ý", code: "IT", description: "Italia - Xứ sở hình chiếc ủng", flag_url: "https://flagcdn.com/w320/it.png" },
            { name: "Thổ Nhĩ Kỳ", code: "TR", description: "Türkiye - Ngã ba châu lục", flag_url: "https://flagcdn.com/w320/tr.png" },
            { name: "Ai Cập", code: "EG", description: "Egypt - Xứ sở kim tự tháp", flag_url: "https://flagcdn.com/w320/eg.png" },
        ];

        const createdCountries: any = { "Việt Nam": vietnam };
        for (const countryData of countriesData) {
            let country = await Country.findOne({ name: countryData.name });
            if (!country) {
                country = await Country.create(countryData);
                console.log(`🌍 Created country: ${countryData.name}`);
            }
            createdCountries[countryData.name] = country;
        }

        // 2. Create Hierarchy Helper
        async function createLocationHierarchy(pName: string, dName: string, wName: string) {
            let province = await Province.findOne({ name: pName });
            if (!province) province = await Province.create({ name: pName, country_id: vietnam!._id });
            
            let district = await District.findOne({ name: dName, province_id: province._id });
            if (!district) district = await District.create({ name: dName, province_id: province._id });
            
            let ward = await Ward.findOne({ name: wName, district_id: district._id });
            if (!ward) ward = await Ward.create({ name: wName, district_id: district._id });
            
            return { province, district, ward };
        }

        // 3. Create Locations for our hotels and extra data
        // Hanoi
        const locHanoi = await createLocationHierarchy("Hà Nội", "Hoàn Kiếm", "Hàng Bài");
        // Da Nang
        const locDaNang = await createLocationHierarchy("Đà Nẵng", "Sơn Trà", "Thọ Quang");
        // Nha Trang
        const locNhaTrang = await createLocationHierarchy("Khánh Hòa", "Nha Trang", "Lộc Thọ");
        // Ho Chi Minh
        const locHCM = await createLocationHierarchy("Hồ Chí Minh", "Quận 1", "Bến Nghé");
        // Da Lat
        const locDaLat = await createLocationHierarchy("Lâm Đồng", "Đà Lạt", "Phường 1");

        // Extra locations for dropdown testing
        const locHaiPhong = await createLocationHierarchy("Hải Phòng", "Hồng Bàng", "Minh Khai");
        const locCanTho = await createLocationHierarchy("Cần Thơ", "Ninh Kiều", "Tân An");
        const locHue = await createLocationHierarchy("Thừa Thiên Huế", "Huế", "Vĩnh Ninh");
        const locVungTau = await createLocationHierarchy("Bà Rịa - Vũng Tàu", "Vũng Tàu", "Phường 1");
        const locPhuQuoc = await createLocationHierarchy("Kiên Giang", "Phú Quốc", "Dương Đông");
        const locSapa = await createLocationHierarchy("Lào Cai", "Sa Pa", "Sa Pa");
        const locHaLong = await createLocationHierarchy("Quảng Ninh", "Hạ Long", "Bãi Cháy");

        // Create Hotels with Unique Addresses and Relations
        const hotelsData = [
            {
                name: "Melia Hanoi Hotel",
                image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
                location: "44B Ly Thuong Kiet, Hoan Kiem, Hanoi",
                address: {
                    address_detail: "44B Ly Thuong Kiet",
                    country_id: vietnam._id,
                    province_id: locHanoi.province._id,
                    district_id: locHanoi.district._id,
                    ward_id: locHanoi.ward._id,
                    postal_code: "10000",
                    latitude: 21.028511,
                    longitude: 105.804817
                },
                description: "Luxurious 5-star hotel in the heart of Hanoi, offering stunning city views and world-class amenities.",
                rating: 4.8,
                rooms: 306,
                availableRooms: 150,
                priceRange: "3,000,000 - 15,000,000 VND",
                priceTwoSingleBed: 3500000,
                priceOneSingleOneDoubleBed: 5500000,
                images: [
                     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Melia_Hanoi_Hotel_01.JPG/1280px-Melia_Hanoi_Hotel_01.JPG",
                     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Melia_Hanoi_Hotel_02.JPG/1280px-Melia_Hanoi_Hotel_02.JPG",
                     "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80"
                ]
            },
            {
                name: "Sofitel Legend Metropole Hanoi",
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sofitel_Metropole_Hanoi_01.jpg/1280px-Sofitel_Metropole_Hanoi_01.jpg",
                location: "15 Ngo Quyen Street, Hoan Kiem District, Hanoi",
                address: {
                    address_detail: "15 Ngo Quyen",
                    country_id: vietnam._id,
                    province_id: locHanoi.province._id,
                    district_id: locHanoi.district._id,
                    ward_id: locHanoi.ward._id,
                    postal_code: "10000",
                    latitude: 21.0251,
                    longitude: 105.8583
                },
                description: "A historic luxury landmark since 1901, located in the heart of Hanoi.",
                rating: 5.0,
                rooms: 364,
                availableRooms: 100,
                priceRange: "5,000,000 - 25,000,000 VND",
                priceTwoSingleBed: 5500000,
                priceOneSingleOneDoubleBed: 8500000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sofitel_Metropole_Hanoi_01.jpg/1280px-Sofitel_Metropole_Hanoi_01.jpg",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Metropole_Hotel_Hanoi.JPG/1280px-Metropole_Hotel_Hanoi.JPG",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Interior_of_Metropole_Hotel_Hanoi.JPG/1280px-Interior_of_Metropole_Hotel_Hanoi.JPG",
                    "https://images.unsplash.com/photo-1551882547-ff43c530dc24?w=1200&q=80"
                ]
            },
            {
                name: "InterContinental Danang",
                image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
                location: "Son Tra Peninsula, Da Nang",
                address: {
                    address_detail: "Son Tra Peninsula",
                    country_id: vietnam._id,
                    province_id: locDaNang.province._id,
                    district_id: locDaNang.district._id,
                    ward_id: locDaNang.ward._id,
                    postal_code: "55000",
                    latitude: 16.1044,
                    longitude: 108.3022
                },
                description: "An award-winning resort nestled in a pristine nature reserve, featuring a private beach and exquisite dining.",
                rating: 5.0,
                rooms: 200,
                availableRooms: 45,
                priceRange: "8,000,000 - 30,000,000 VND",
                priceTwoSingleBed: 8500000,
                priceOneSingleOneDoubleBed: 12500000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Private_Beach_of_InterContinental_Danang_Sun_Peninsula.jpg/1280px-Private_Beach_of_InterContinental_Danang_Sun_Peninsula.jpg",
                    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80",
                    "https://images.unsplash.com/photo-1544124499-58912cbddade?w=1200&q=80"
                ]
            },
            {
                name: "Pullman Danang Beach Resort",
                image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
                location: "101 Vo Nguyen Giap Street, Ngũ Hành Sơn, Da Nang",
                address: {
                    address_detail: "101 Vo Nguyen Giap",
                    country_id: vietnam._id,
                    province_id: locDaNang.province._id,
                    district_id: locDaNang.district._id,
                    ward_id: locDaNang.ward._id,
                    postal_code: "55000",
                    latitude: 16.0378,
                    longitude: 108.2464
                },
                description: "Upscale beach resort featuring an infinity pool and vibrant beachfront dining.",
                rating: 4.7,
                rooms: 186,
                availableRooms: 70,
                priceRange: "3,000,000 - 12,000,000 VND",
                priceTwoSingleBed: 3200000,
                priceOneSingleOneDoubleBed: 5200000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pullman_Danang_Beach_Resort_Pool.jpg/1280px-Pullman_Danang_Beach_Resort_Pool.jpg",
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80"
                ]
            },
            {
                name: "Novotel Nha Trang",
                image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
                location: "50 Tran Phu, Nha Trang",
                address: {
                    address_detail: "50 Tran Phu",
                    country_id: vietnam._id,
                    province_id: locNhaTrang.province._id,
                    district_id: locNhaTrang.district._id,
                    ward_id: locNhaTrang.ward._id,
                    postal_code: "65000",
                    latitude: 12.2388,
                    longitude: 109.1967
                },
                description: "Modern beachfront hotel with balcony rooms overlooking the bay.",
                rating: 4.5,
                rooms: 154,
                availableRooms: 120,
                priceRange: "2,000,000 - 5,000,000 VND",
                priceTwoSingleBed: 2200000,
                priceOneSingleOneDoubleBed: 3500000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Novotel_Nha_Trang.jpg/800px-Novotel_Nha_Trang.jpg",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
                    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80"
                ]
            },
            {
                name: "Rex Hotel Saigon",
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rex_Hotel_P1310939.jpg/1280px-Rex_Hotel_P1310939.jpg", 
                location: "141 Nguyen Hue, District 1, Ho Chi Minh City",
                address: {
                    address_detail: "141 Nguyen Hue",
                    country_id: vietnam._id,
                    province_id: locHCM.province._id,
                    district_id: locHCM.district._id,
                    ward_id: locHCM.ward._id,
                    postal_code: "70000",
                    latitude: 10.7760,
                    longitude: 106.7009
                },
                description: "Historic luxury heritage hotel in the center of bustling Saigon.",
                rating: 4.6,
                rooms: 286,
                availableRooms: 50,
                priceRange: "2,500,000 - 8,000,000 VND",
                priceTwoSingleBed: 2800000,
                priceOneSingleOneDoubleBed: 4200000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rex_Hotel_P1310939.jpg/1280px-Rex_Hotel_P1310939.jpg",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rex_Hotel_Saigon_Side.jpg/1280px-Rex_Hotel_Saigon_Side.jpg",
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80"
                ]
            },
            {
                name: "Park Hyatt Saigon",
                image_url: "https://images.unsplash.com/photo-1551882547-ff43c530dc24?w=1200&q=80",
                location: "2 Lam Son Square, District 1, Ho Chi Minh City",
                address: {
                    address_detail: "2 Lam Son Square",
                    country_id: vietnam._id,
                    province_id: locHCM.province._id,
                    district_id: locHCM.district._id,
                    ward_id: locHCM.ward._id,
                    postal_code: "70000",
                    latitude: 10.7765,
                    longitude: 106.7031
                },
                description: "Elegant French colonial-style hotel overlooking the Opera House.",
                rating: 4.9,
                rooms: 245,
                availableRooms: 60,
                priceRange: "6,000,000 - 20,000,000 VND",
                priceTwoSingleBed: 6500000,
                priceOneSingleOneDoubleBed: 9500000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Park_Hyatt_Saigon.jpg/1280px-Park_Hyatt_Saigon.jpg",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Park_Hyatt_Saigon_Side_View.jpg/1280px-Park_Hyatt_Saigon_Side_View.jpg",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80"
                ]
            },
            {
                name: "Memory Da Lat",
                image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
                location: "24 Hung Vuong, Da Lat",
                address: {
                    address_detail: "24 Hung Vuong",
                    country_id: vietnam._id,
                    province_id: locDaLat.province._id,
                    district_id: locDaLat.district._id,
                    ward_id: locDaLat.ward._id,
                    postal_code: "67000",
                    latitude: 11.9404,
                    longitude: 108.4583
                },
                description: "Vintage villa with cozy rooms and a beautiful garden.",
                rating: 4.2,
                rooms: 15,
                availableRooms: 5,
                priceRange: "500,000 - 1,500,000 VND",
                priceTwoSingleBed: 600000,
                priceOneSingleOneDoubleBed: 900000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Villa_Dalat_Vietnam_%28ann%C3%A9es_30%29.jpg/800px-Villa_Dalat_Vietnam_%28ann%C3%A9es_30%29.jpg",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
                    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80"
                ]
            },
            {
                name: "JW Marriott Phu Quoc Emerald Bay",
                image_url: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=1200&q=80",
                location: "Bai Khem, An Thoi Town, Phu Quoc Island",
                address: {
                    address_detail: "Bai Khem",
                    country_id: vietnam._id,
                    province_id: locPhuQuoc.province._id,
                    district_id: locPhuQuoc.district._id,
                    ward_id: locPhuQuoc.ward._id,
                    postal_code: "92000",
                    latitude: 10.0267,
                    longitude: 104.0242
                },
                description: "Stunning university-themed resort designed by Bill Bensley on a private beach.",
                rating: 4.9,
                rooms: 234,
                availableRooms: 80,
                priceRange: "7,000,000 - 45,000,000 VND",
                priceTwoSingleBed: 7500000,
                priceOneSingleOneDoubleBed: 12500000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/JW_Marriott_Phu_Quoc_Resort_Beach.jpg/1280px-JW_Marriott_Phu_Quoc_Resort_Beach.jpg",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
                    "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=1200&q=80"
                ]
            },
            {
                name: "Hotel de la Coupole - MGallery",
                image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
                location: "1 Hoang Lien Street, Sapa Town, Lao Cai",
                address: {
                    address_detail: "1 Hoang Lien",
                    country_id: vietnam._id,
                    province_id: locSapa.province._id,
                    district_id: locSapa.district._id,
                    ward_id: locSapa.ward._id,
                    postal_code: "33000",
                    latitude: 22.3364,
                    longitude: 103.8438
                },
                description: "A fusion of high fashion and hill station style in the mist-shrouded mountains of Sapa.",
                rating: 4.8,
                rooms: 249,
                availableRooms: 95,
                priceRange: "3,500,000 - 15,000,000 VND",
                priceTwoSingleBed: 3800000,
                priceOneSingleOneDoubleBed: 5800000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hotel_de_la_Coupole_Sapa.jpg/1280px-Hotel_de_la_Coupole_Sapa.jpg",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/View_from_Hotel_de_la_Coupole.jpg/1280px-View_from_Hotel_de_la_Coupole.jpg",
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
                ]
            },
            {
                name: "The Imperial Hotel Vung Tau",
                image_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
                location: "159 Thuy Van Street, Vung Tau City",
                address: {
                    address_detail: "159 Thuy Van",
                    country_id: vietnam._id,
                    province_id: locVungTau.province._id,
                    district_id: locVungTau.district._id,
                    ward_id: locVungTau.ward._id,
                    postal_code: "79000",
                    latitude: 10.3392,
                    longitude: 107.1006
                },
                description: "Victorian-style luxury hotel inspired by the English castle era, located on Back Beach.",
                rating: 4.6,
                rooms: 144,
                availableRooms: 40,
                priceRange: "2,500,000 - 10,000,000 VND",
                priceTwoSingleBed: 2800000,
                priceOneSingleOneDoubleBed: 4500000,
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/The_Imperial_Hotel_Vung_Tau.jpg/1280px-The_Imperial_Hotel_Vung_Tau.jpg",
                    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
                ]
            }
        ];

        // Create or Update Hotels with Unique Addresses and Relations
        for (const hotelData of hotelsData) {
            let hotel = await Hotel.findOne({ name: hotelData.name });
            
            if (!hotel) {
                // Create independent address for each hotel
                const address = await Address.create(hotelData.address);
                
                // Create hotel linked to this address
                await Hotel.create({
                    ...hotelData,
                    address_id: address._id,
                    address: undefined 
                });
                console.log(`🏨 Created: ${hotelData.name}`);
            } else {
                // Update existing hotel with new images and data
                await Hotel.findByIdAndUpdate(hotel._id, {
                    $set: {
                        image_url: hotelData.image_url,
                        images: hotelData.images,
                        description: hotelData.description,
                        rating: hotelData.rating,
                        priceRange: hotelData.priceRange,
                        priceTwoSingleBed: hotelData.priceTwoSingleBed,
                        priceOneSingleOneDoubleBed: hotelData.priceOneSingleOneDoubleBed,
                        availableRooms: hotelData.availableRooms,
                        rooms: hotelData.rooms
                    }
                });
                console.log(`🔄 Updated: ${hotelData.name}`);
            }
        }
        
        console.log(`✅ Seeding hotels check complete!`);

        // Create Destinations
        // await Destination.deleteMany({});
        // console.log("🧹 Cleared existing Destinations");

        const destinationsData = [
            {
                name: "Hồ Hoàn Kiếm",
                description: "Trái tim của thủ đô Hà Nội, nổi tiếng với Tháp Rùa và Đền Ngọc Sơn.",
                category: "historic",
                country_id: vietnam._id,
                address: {
                     address_detail: "Hàng Trống, Hoàn Kiếm",
                     country_id: vietnam._id,
                     province_id: locHanoi.province._id,
                     district_id: locHanoi.district._id,
                     ward_id: locHanoi.ward._id,
                     postal_code: "10000",
                     latitude: 21.0285,
                     longitude: 105.8542
                },
                rating: 4.8,
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hoan_Kiem_Lake_2016.jpg/1200px-Hoan_Kiem_Lake_2016.jpg",
                images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hoan_Kiem_Lake_2016.jpg/1200px-Hoan_Kiem_Lake_2016.jpg"]
            },
            {
                name: "Bán đảo Sơn Trà",
                description: "Khu bảo tồn thiên nhiên tuyệt đẹp với bãi biển hoang sơ và hệ động thực vật phong phú.",
                category: "nature",
                country_id: vietnam._id,
                address: {
                    address_detail: "Thọ Quang, Sơn Trà",
                    country_id: vietnam._id,
                    province_id: locDaNang.province._id,
                    district_id: locDaNang.district._id,
                    ward_id: locDaNang.ward._id,
                    postal_code: "55000",
                    latitude: 16.1167,
                    longitude: 108.2667
                },
                rating: 4.7,
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Son_Tra_Peninsula.jpg/1200px-Son_Tra_Peninsula.jpg",
                images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Son_Tra_Peninsula.jpg/1200px-Son_Tra_Peninsula.jpg"]
            },
             {
                name: "Biển Nha Trang",
                description: "Một trong những vịnh biển đẹp nhất thế giới với bãi cát trắng mịn và nước biển trong xanh.",
                category: "beach",
                country_id: vietnam._id,
                address: {
                    address_detail: "Đường Trần Phú",
                    country_id: vietnam._id,
                    province_id: locNhaTrang.province._id,
                    district_id: locNhaTrang.district._id,
                    ward_id: locNhaTrang.ward._id,
                    postal_code: "65000",
                    latitude: 12.2388,
                    longitude: 109.1967
                },
                rating: 4.6,
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nha_Trang_Beach.jpg/1200px-Nha_Trang_Beach.jpg",
                images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nha_Trang_Beach.jpg/1200px-Nha_Trang_Beach.jpg"]
            },
            {
                name: "Chợ Bến Thành",
                description: "Biểu tượng của thành phố Hồ Chí Minh, nơi buôn bán sầm uất và ẩm thực phong phú.",
                category: "shopping",
                country_id: vietnam._id,
                address: {
                    address_detail: "Đường Lê Lợi, Bến Thành",
                    country_id: vietnam._id,
                    province_id: locHCM.province._id,
                    district_id: locHCM.district._id,
                    ward_id: locHCM.ward._id,
                    postal_code: "70000",
                    latitude: 10.7725,
                    longitude: 106.6980
                },
                rating: 4.5,
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Cho_Ben_Thanh.jpg/1200px-Cho_Ben_Thanh.jpg",
                images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Cho_Ben_Thanh.jpg/1200px-Cho_Ben_Thanh.jpg"]
            },
             {
                name: "Núi Lang Biang",
                description: "Nóc nhà của Đà Lạt, địa điểm lý tưởng để ngắm toàn cảnh thành phố sương mù.",
                category: "mountain",
                country_id: vietnam._id,
                address: {
                    address_detail: "Lạc Dương, Lâm Đồng",
                    country_id: vietnam._id,
                     province_id: locDaLat.province._id,
                    district_id: locDaLat.district._id,
                    ward_id: locDaLat.ward._id,
                    postal_code: "67000",
                    latitude: 12.0435,
                    longitude: 108.4394
                },
                rating: 4.4,
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lang_Biang.jpg/1200px-Lang_Biang.jpg",
                images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lang_Biang.jpg/1200px-Lang_Biang.jpg"]
            }
        ];

        for (const destData of destinationsData) {
            let existing = await Destination.findOne({ name: destData.name });
            if (!existing) {
                const address = await Address.create(destData.address);
                await Destination.create({
                    ...destData,
                    address_id: address._id,
                    address: undefined
                });
                console.log(`📍 Created Destination: ${destData.name}`);
            } else {
                await Destination.findByIdAndUpdate(existing._id, {
                    $set: {
                        description: destData.description,
                        image_url: destData.image_url,
                        images: destData.images,
                        rating: destData.rating,
                        category: destData.category
                    }
                });
                console.log(`🔄 Updated Destination: ${destData.name}`);
            }
        }
        
        console.log(`✅ Seeding destinations check complete!`);

        // === SEED SERVICES (Dịch vụ chung cho Tour, Hotel, Flight) ===
        console.log("🛎️ Seeding services...");
        const servicesData = [
            // Meal Services
            { name: "Bữa sáng buffet", description: "Bữa sáng buffet phong phú", category: "meal", icon: "🍳", is_active: true },
            { name: "Bữa trưa trọn gói", description: "Bữa trưa theo thực đơn", category: "meal", icon: "🍱", is_active: true },
            { name: "Bữa tối đặc sản", description: "Bữa tối với đặc sản địa phương", category: "meal", icon: "🍽️", is_active: true },
            { name: "Đồ ăn nhẹ trên xe", description: "Snacks và nước uống", category: "meal", icon: "🥤", is_active: true },
            
            // Transport Services
            { name: "Đưa đón sân bay", description: "Đưa đón từ/đến sân bay", category: "transport", icon: "✈️", is_active: true },
            { name: "Xe bus đời mới", description: "Xe bus điều hòa đời mới", category: "transport", icon: "🚌", is_active: true },
            { name: "Xe limousine", description: "Xe limousine cao cấp", category: "transport", icon: "🚐", is_active: true },
            
            // Entertainment
            { name: "Hướng dẫn viên tiếng Việt", description: "HDV chuyên nghiệp tiếng Việt", category: "entertainment", icon: "🎤", is_active: true },
            { name: "Vé tham quan điểm du lịch", description: "Vé vào cửa các điểm tham quan", category: "entertainment", icon: "🎫", is_active: true },
            { name: "Hoạt động team building", description: "Các hoạt động vui chơi tập thể", category: "entertainment", icon: "🎯", is_active: true },
            
            // Amenities
            { name: "WiFi miễn phí", description: "Kết nối WiFi tốc độ cao", category: "amenity", icon: "📶", is_active: true },
            { name: "Điều hòa", description: "Hệ thống điều hòa nhiệt độ", category: "amenity", icon: "❄️", is_active: true },
            { name: "Nước uống miễn phí", description: "Nước suối miễn phí", category: "amenity", icon: "💧", is_active: true },
            { name: "Khăn tắm & dép", description: "Khăn tắm và dép đi trong phòng", category: "amenity", icon: "🧴", is_active: true },
            
            // Insurance
            { name: "Bảo hiểm du lịch", description: "Bảo hiểm tai nạn trong chuyến đi", category: "insurance", icon: "🛡️", is_active: true },
            { name: "Bảo hiểm y tế", description: "Bảo hiểm y tế cơ bản", category: "insurance", icon: "⚕️", is_active: true },
        ];

        const createdServices: any = {};
        for (const svc of servicesData) {
            let existing = await Service.findOne({ name: svc.name });
            if (!existing) {
                existing = await Service.create(svc);
                console.log(`🛎️ Created service: ${svc.name}`);
            }
            createdServices[svc.name] = existing;
        }

        console.log(`✅ Services seeded successfully!`);

        // === MAP DEPARTURE PROVINCES (for Tours) ===
        console.log("🗺️ Mapping departure provinces...");
        const createdDepartureLocations: any = {};
        
        // Map existing provinces for departure locations
        const haNoi = await Province.findOne({ name: { $regex: "Hà Nội", $options: "i" } });
        const hoChiMinh = await Province.findOne({ name: { $regex: "Hồ Chí Minh", $options: "i" } });
        const daNang = await Province.findOne({ name: { $regex: "Đà Nẵng", $options: "i" } });
        
        if (haNoi) createdDepartureLocations["Hà Nội"] = haNoi;
        if (hoChiMinh) createdDepartureLocations["TP. Hồ Chí Minh"] = hoChiMinh;
        if (daNang) createdDepartureLocations["Đà Nẵng"] = daNang;
        
        console.log(`✅ Mapped ${Object.keys(createdDepartureLocations).length} departure provinces!`);

        // === SEED TOURS ===
        console.log("🎫 Seeding tours...");
        
        // Helper: Tạo ngày khởi hành trong vòng 3 tháng tới
        const generateDepartureDates = (count: number = 8) => {
            const dates = [];
            const today = new Date();
            for (let i = 0; i < count; i++) {
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + (i * 7) + Math.floor(Math.random() * 3)); // Mỗi tuần + random 0-2 ngày
                dates.push(futureDate);
            }
            return dates;
        };

        const toursData = [
            {
                name: "Tour Hạ Long - Ninh Bình 3N2Đ",
                tour_code: "HL-NB-3N2D-01",
                description: "Khám phá vịnh Hạ Long - Di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi kỳ vĩ. Ghé thăm Tràng An - 'Vịnh Hạ Long trên cạn' với hệ thống hang động tuyệt đẹp. Tour bao gồm du thuyền 5 sao qua đêm trên vịnh, chèo thuyền kayak, tham quan hang Sửng Sốt và đảo Titop. Tại Ninh Bình, trải nghiệm đi thuyền ngắm cảnh Tam Cốc - Bích Động, tham quan chùa Bái Đính và Tràng An.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 4890000,
                child_price: 3450000,
                duration_days: 3,
                rating: 4.8,
                departure_dates: generateDepartureDates(10),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Xe bus đời mới"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                itinerary: [
                    {
                        day: 1,
                        title: "Hà Nội - Ninh Bình - Tam Cốc",
                        description: "Xe và hướng dẫn viên đón quý khách tại điểm hẹn, khởi hành đi Ninh Bình. Tham quan Tam Cốc - Bích Động, đi thuyền ngắm cảnh hang động tuyệt đẹp.",
                        meals: ["Trưa", "Tối"],
                        image: "https://images.unsplash.com/photo-1591289009723-aef3a3a19eac?w=400"
                    },
                    {
                        day: 2,
                        title: "Ninh Bình - Hạ Long - Du thuyền 5 sao",
                        description: "Tham quan chùa Bái Đính, sau đó khởi hành đi Hạ Long. Lên du thuyền 5 sao, thưởng thức buffet hải sản, ngắm hoàng hôn trên vịnh.",
                        meals: ["Sáng", "Trưa", "Tối"],
                        image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400"
                    },
                    {
                        day: 3,
                        title: "Hạ Long - Hang Sửng Sốt - Đảo Titop - Hà Nội",
                        description: "Tham quan hang Sửng Sốt, chèo kayak, leo đảo Titop ngắm toàn cảnh vịnh. Trở về Hà Nội với những kỷ niệm đẹp.",
                        meals: ["Sáng", "Trưa"],
                        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400"
                    }
                ],
                included_services_detail: {
                    transport: "Xe du lịch đời mới 16, 29, 45 chỗ ngồi điều hòa suốt tuyến.",
                    accommodation: "Du thuyền 5 sao 1 đêm, khách sạn 3 sao 1 đêm, tiêu chuẩn 2 khách/phòng.",
                    meals: "Các bữa ăn theo chương trình. Bao gồm buffet hải sản trên du thuyền.",
                    guide: "Hướng dẫn viên chuyên nghiệp, nhiệt tình suốt tuyến.",
                    extras: [
                        "Vé tham quan các điểm theo chương trình.",
                        "Vé thuyền Tam Cốc, vé du thuyền Hạ Long.",
                        "Nước suối + khăn lạnh.",
                        "Bảo hiểm du lịch tối đa 30.000.000đ/vụ.",
                        "Thuế VAT."
                    ]
                },
                excluded_services: [
                    "Các điểm tham quan ngoài chương trình.",
                    "Chi phí cá nhân: giặt ủi, điện thoại, minibar.",
                    "Tiền tip cho tài xế và hướng dẫn viên.",
                    "Chèo kayak: 100.000đ/người (tùy chọn).",
                    "Nâng cấp phòng đơn hoặc phòng hạng cao hơn."
                ],
                images: [
                    "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
                    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80",
                    "https://images.unsplash.com/photo-1591150129318-0da96204ad1c?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80"
            },
            {
                name: "Tour Sapa - Fansipan - Bản Cát Cát 4N3Đ",
                description: "Chinh phục đỉnh Fansipan 3.143m - 'Nóc nhà Đông Dương' bằng hệ thống cáp treo hiện đại nhất Đông Nam Á. Khám phá thị trấn Sapa mờ sương, trekking qua các bản làng dân tộc H'Mông, Dao Đỏ tại Bản Cát Cát, Tả Van, Lao Chải. Ngắm ruộng bậc thang mùa lúa chín vàng óng, trải nghiệm homestay, thưởng thức ẩm thực núi rừng đặc sắc. Tham quan thác Bạc, cầu Mây Rồng, chợ tình Sapa và phố cổ.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 6990000,
                child_price: 4950000,
                duration_days: 4,
                rating: 4.9,
                departure_dates: generateDepartureDates(8),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Xe limousine"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1583339793403-3d9b001b6008?w=1200&q=80",
                    "https://images.unsplash.com/photo-1570365790857-c2c8885992e1?w=1200&q=80",
                    "https://images.unsplash.com/photo-1568103405751-0e040ac5c0ce?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1583339793403-3d9b001b6008?w=1600&q=80"
            },
            {
                name: "Tour Phú Quốc - Bãi Sao - Nam Đảo 4N3Đ",
                description: "Tận hưởng thiên đường biển đảo Phú Quốc với bãi Sao trắng mịn màng, nước biển trong xanh. Tour câu cá, lặn ngắm san hô tại Hòn Thơm, Hòn Móng Tay. Khám phá rừng nguyên sinh Vườn quốc gia Phú Quốc, tham quan Dinh Cậu, nhà thùng sản xuất nước mắm truyền thống. Trải nghiệm cáp treo Hòn Thơm dài nhất thế giới, tắm bùn khoáng, chơi tại VinWonders và Safari. Thưởng thức hải sản tươi sống tại chợ đêm Dinh Cậu.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 7590000,
                child_price: 5290000,
                duration_days: 4,
                rating: 4.7,
                departure_dates: generateDepartureDates(12),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Đưa đón sân bay"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Hoạt động team building"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
                    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80",
                    "https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=80"
            },
            {
                name: "Tour Đà Lạt Lãng Mạn - Thành Phố Ngàn Hoa 3N2Đ",
                tour_code: "DL-3N2D-01",
                description: "Khám phá Đà Lạt - thành phố ngàn hoa với khí hậu mát mẻ quanh năm. Tham quan Thác Datanla với trò chơi máng trượt Roller Coaster, đồi chè Cầu Đất để check-in ảnh đẹp, vườn hoa lavender tím biếc. Ghé thăm Thiền viện Trúc Lâm, hồ Tuyền Lâm yên bình, Crazy House độc đáo. Thưởng thức cafe view đẹp, bánh tráng nướng, lẩu gà lá é, dâu tây tươi. Dạo phố đêm Đà Lạt, shopping tại chợ đêm, thưởng thức nghệ thuật tại Nhà ga cổ Đà Lạt.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 3990000,
                child_price: 2890000,
                duration_days: 3,
                rating: 4.6,
                departure_dates: generateDepartureDates(15),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Xe limousine"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                itinerary: [
                    {
                        day: 0,
                        title: "HCM - Đà Lạt (Nghỉ Đêm Trên Xe)",
                        description: "Quý khách tập trung tại điểm hẹn, xe và hướng dẫn viên đón quý khách khởi hành đi Đà Lạt. Nghỉ đêm trên xe.",
                        meals: [],
                        image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400"
                    },
                    {
                        day: 1,
                        title: "Thiền Viện Trúc Lâm - Thác Datanla - Đồi Chè Cầu Đất",
                        description: "Tham quan Thiền Viện Trúc Lâm, trải nghiệm máng trượt Roller Coaster tại Thác Datanla, check-in đồi chè Cầu Đất.",
                        meals: ["Sáng", "Trưa", "Tối"],
                        image: "https://images.unsplash.com/photo-1583522216-3fc542566d5f?w=400"
                    },
                    {
                        day: 2,
                        title: "Vườn Hoa - Crazy House - Hồ Tuyền Lâm",
                        description: "Tham quan vườn hoa lavender, Crazy House độc đáo, hồ Tuyền Lâm yên bình. Dạo phố đêm, chợ đêm Đà Lạt.",
                        meals: ["Sáng", "Trưa"],
                        image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400"
                    },
                    {
                        day: 3,
                        title: "Đà Lạt - Nhà Ga Cổ - HCM",
                        description: "Tham quan Nhà ga cổ Đà Lạt, mua quà đặc sản. Trở về HCM với những kỷ niệm đẹp.",
                        meals: ["Sáng", "Trưa"],
                        image: "https://images.unsplash.com/photo-1586339277861-c0fd27c7b6cd?w=400"
                    }
                ],
                included_services_detail: {
                    transport: "Xe limousine ghế ngã 16, 29 chỗ suốt tuyến (tùy theo số lượng).",
                    accommodation: "Khách sạn 2-3 sao địa phương, tiêu chuẩn 2-4 khách/phòng.",
                    meals: "Các bữa ăn theo chương trình. Có 1 bữa đặc sản Gà nướng cơm lam + Lẩu gà Lá É.",
                    guide: "HDV theo đoàn suốt tuyến.",
                    extras: [
                        "Vé tham quan theo chương trình.",
                        "Nón du lịch + nước suối + khăn lạnh.",
                        "Bảo hiểm du lịch tối đa 30.000.000đ/vụ.",
                        "Thuế VAT."
                    ]
                },
                excluded_services: [
                    "Các điểm tham quan nằm ngoài chương trình.",
                    "Chi phí cá nhân giặt ủi, điện thoại, ăn uống ngoài chương trình, nước uống tại các điểm tham quan.",
                    "Tiền tip cho tài xế và HDV (nếu có).",
                    "02 bữa sáng và 01 bữa tối tự túc.",
                    "Nâng cấp tiêu chuẩn khách sạn (nếu có nhu cầu)."
                ],
                images: [
                    "https://images.unsplash.com/photo-1583522216-3fc542566d5f?w=1200&q=80",
                    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80",
                    "https://images.unsplash.com/photo-1586339277861-c0fd27c7b6cd?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1583522216-3fc542566d5f?w=1600&q=80"
            },
            {
                name: "Tour Di Sản Miền Trung: Hội An - Huế - Động Phong Nha 5N4Đ",
                description: "Hành trình khám phá 3 di sản thế giới UNESCO. Phố cổ Hội An với đèn lồng lung linh, nhà cổ Tấn Ký, chùa Cầu 400 năm tuổi, làng gốm Thanh Hà. Cố đô Huế với Đại Nội, lăng Khải Định, lăng Tự Đức, chùa Thiên Mụ, thưởng thức cơm hến, bún bò Huế. Động Phong Nha - vương quốc hang động với Thiên Đường, Phong Nha, sông Chày Hang Tối. Tắm biển Mỹ Khê, ăn hải sản tươi ngon. Trải nghiệm du thuyền sông Hương, nghe hò Huế, thả đèn hoa đăng.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["Đà Nẵng"]._id,
                adult_price: 8790000,
                child_price: 6190000,
                duration_days: 5,
                rating: 4.9,
                departure_dates: generateDepartureDates(10),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Xe bus đời mới"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
                    "https://images.unsplash.com/photo-1580837119756-563d608dd119?w=1200&q=80",
                    "https://images.unsplash.com/photo-1583222881551-a04d7cc05bfe?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80"
            },
            {
                name: "Tour Mũi Né - Phan Thiết - Đồi Cát Bay 2N1Đ",
                description: "Trải nghiệm đồi cát bay (White Sand Dunes) tuyệt đẹp với hoạt động trượt cát, đua xe jeep trên sa mạc. Ngắm bình minh tại Bàu Trắng với hồ nước trong xanh giữa sa mạc. Tham quan đồi cát Hồng (Red Sand Dunes), làng chài Mũi Né xưa với thuyền thúng đầy màu sắc. Thưởng thức hải sản tươi sống: cá ngừ, cá thu, nhum biển, ghẹ. Ghé suối tiên với dòng nước chảy giữa khe đá đỏ độc đáo, tháp Chăm Poshanu cổ kính.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 2990000,
                child_price: 2190000,
                duration_days: 2,
                rating: 4.5,
                departure_dates: generateDepartureDates(20),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Xe bus đời mới"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=1200&q=80",
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
                    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=1600&q=80"
            },
            {
                name: "Tour Nha Trang Biển Xanh - Vinpearl 4N3Đ",
                description: "Tận hưởng thiên đường biển Nha Trang với bãi biển đẹp nhất Việt Nam. Tour 4 đảo: Hòn Mun lặn ngắm san hô, Hòn Tằm tắm biển, Hòn Miếu tham quan thủy cung, Bãi Tranh BBQ hải sản. Vui chơi cả ngày tại VinWonders, trải nghiệm cáp treo vượt biển dài nhất thế giới. Tắm bùn khoáng I-Resort, ngâm khoáng nóng, massage thư giãn. Check-in tháp Bà Ponagar, nhà thờ Đá, làng chài Xóm Bông. Thưởng thức hải sản tươi sống, nem nướng, bánh căn, bún chả cá.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 5690000,
                child_price: 3990000,
                duration_days: 4,
                rating: 4.7,
                departure_dates: generateDepartureDates(12),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Xe limousine"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Hoạt động team building"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
                    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
                    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1600&q=80"
            },
            {
                name: "Tour Tây Bắc - Mù Cang Chải - Ruộng Bậc Thang 5N4Đ",
                description: "Khám phá ruộng bậc thang đẹp nhất Việt Nam - Di sản văn hóa phi vật thể. Ngắm cảnh Mù Cang Chải mùa lúa chín vàng óng, check-in tại Khau Phạ - đèo hiểm trở bậc nhất Tây Bắc. Ghé thăm bản Lao Chải, Tả Van, Tú Lệ với người Thái, H'Mông, Dao. Trải nghiệm homestay, tìm hiểu văn hóa dân tộc, thưởng thức cơm lam, thịt trâu gác bếp, rượu ngô. Tham quan thác Mơ, thung lũng Tú Lệ, suối nước nóng Mù Cang Chải. Ngắm hoàng hôn trên ruộng bậc thang Lìm Mông, Chế Cu Nha.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 7790000,
                child_price: 5490000,
                duration_days: 5,
                rating: 4.8,
                departure_dates: generateDepartureDates(8),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Xe bus đời mới"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80",
                    "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
                    "https://images.unsplash.com/photo-1591289009723-aef3a3a19eac?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600&q=80"
            },
            {
                name: "Tour Vịnh Hạ Long - Cát Bà - Lan Hạ 3N2Đ Premium",
                description: "Trải nghiệm vịnh Hạ Long đẳng cấp với du thuyền 5 sao qua đêm. Khám phá 3 vịnh: Hạ Long, Bái Tử Long và Lan Hạ với hệ sinh thái biển phong phú. Tham quan hang Sửng Sốt - hang động đẹp nhất vịnh, leo đảo Titop ngắm toàn cảnh, chèo kayak qua hang Luồn. Đảo Cát Bà với Vườn quốc gia, bãi biển Cát Cò, làng chài Viet Hai. Vịnh Lan Hạ tuyệt đẹp ít người biết, bơi lội, lặn ngắm san hô. Thưởng thức buffet hải sản cao cấp trên du thuyền, câu mực đêm, tai chi buổi sáng, spa thư giãn.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 6290000,
                child_price: 4490000,
                duration_days: 3,
                rating: 4.9,
                departure_dates: generateDepartureDates(10),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Xe limousine"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
                    "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
                    "https://images.unsplash.com/photo-1583339793403-3d9b001b6008?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80"
            },
            {
                name: "Tour Côn Đảo Huyền Thoại - Biển Xanh Hoang Sơ 3N2Đ",
                description: "Khám phá Côn Đảo - hòn đảo thiên đường với biển xanh trong vắt, rừng nguyên sinh. Tham quan nhà tù Côn Đảo - di tích lịch sử, nghĩa trang Hàng Dương. Lặn biển ngắm san hô tại vịnh Đầm Tre, Ông Đụng, bãi Nhát. Trekking khám phá Vườn quốc gia Côn Đảo, tìm hiểu hệ sinh thái rừng nhiệt đới. Thưởng thức hải sản tươi sống: cá mú, tôm hùm, ốc hương. Tắm biển bãi Nhát hoang sơ, bãi Đầm Trầu tuyệt đẹp. Ngắm hoàng hôn tại bãi Ông Đụng, check-in cầu tàu 914.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 8990000,
                child_price: 6490000,
                duration_days: 3,
                rating: 4.8,
                departure_dates: generateDepartureDates(8),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Đưa đón sân bay"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Hoạt động team building"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=80",
                    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
                    "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&q=80"
            },
            {
                name: "Tour Đồng Bằng Sông Cửu Long - Miệt Vườn 3N2Đ",
                description: "Khám phá miền Tây sông nước với chợ nổi Cái Răng sầm uất, đi thuyền qua rạch nhỏ ngắm vườn trái cây. Ghé thăm vườn dừa Bảy Mẫu, làng nghề kẹo dừa Bến Tre, thưởng thức trái cây tươi ngon: sầu riêng, chôm chôm, măng cụt. Trải nghiệm đò lá dừa, câu cá, hát đờn ca tài tử. Tham quan chùa Vĩnh Tràng, nhà cổ Bình Thủy, vườn chim Bằng Lăng. Thưởng thức đặc sản: cá lóc nướng trui, bánh xèo, lẩu mắm, cơm hến. Ghế thăm cồn Thới Sơn, Tân Lộc, Quy Đức với vườn nhãn, vườn sầu riêng bạt ngàn.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 4290000,
                child_price: 2990000,
                duration_days: 3,
                rating: 4.6,
                departure_dates: generateDepartureDates(15),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Xe bus đời mới"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1552850638-4d452a899920?w=1200&q=80",
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1552850638-4d452a899920?w=1600&q=80"
            },
            {
                name: "Tour Quy Nhơn - Phú Yên Hoang Sơ 4N3Đ",
                description: "Khám phá bờ biển miền Trung hoang sơ chưa bị thương mại hóa. Quy Nhơn với bãi Xép tuyệt đẹp, Eo Gió thơ mộng, ghềnh Ráng - địa danh trường ca Tây Tiến. Phú Yên với Gành Đá Đĩa kỳ vĩ, hải đăng Mũi Điện, bãi Môn tuyệt đẹp, vịnh Vũng Rô yên bình. Check-in cầu gỗ Mỹ Khê, đập đá Hàn, tháp Nhạn Chăm cổ. Thưởng thức hải sản tươi sống, bánh hỏi chả cá, bánh xèo tôm nhảy, tuna mắt thuyền. Trải nghiệm bơi biển, lặn ngắm san hô, chèo SUP, trekking.",
                country_id: vietnam._id,
                departure_location_id: createdDepartureLocations["Đà Nẵng"]._id,
                adult_price: 5990000,
                child_price: 4190000,
                duration_days: 4,
                rating: 4.7,
                departure_dates: generateDepartureDates(10),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Xe bus đời mới"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                images: [
                    "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1200&q=80",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
                ],
                banner_url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1600&q=80"
            },
            // =============== TOUR NƯỚC NGOÀI ===============
            {
                name: "Tour Thái Lan: Bangkok - Pattaya 5N4Đ",
                tour_code: "TH-BKK-5N4D-01",
                description: "Khám phá Thái Lan với Hoàng cung lộng lẫy, chùa Phật Vàng, chùa Phật Ngọc linh thiêng. Pattaya sôi động với show Alcazar nổi tiếng, đảo San Hô xinh đẹp. Thưởng thức ẩm thực Thái: Tom Yum, Pad Thai, xoài sticky rice. Shopping thiên đường tại Platinum, MBK, Asiatique.",
                country_id: createdCountries["Thái Lan"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 8990000,
                child_price: 6990000,
                duration_days: 5,
                rating: 4.7,
                departure_dates: generateDepartureDates(12),
                included_services: [
                    createdServices["Bữa sáng buffet"]._id,
                    createdServices["Bữa trưa trọn gói"]._id,
                    createdServices["Bữa tối đặc sản"]._id,
                    createdServices["Đưa đón sân bay"]._id,
                    createdServices["Hướng dẫn viên tiếng Việt"]._id,
                    createdServices["Vé tham quan điểm du lịch"]._id,
                    createdServices["Bảo hiểm du lịch"]._id,
                ],
                itinerary: [
                    { day: 1, title: "HCM - Bangkok - Pattaya", description: "Bay đến Bangkok, di chuyển Pattaya, tham quan Nong Nooch Garden.", meals: ["Trưa", "Tối"], image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400" },
                    { day: 2, title: "Đảo San Hô - Show Alcazar", description: "Tham quan đảo San Hô, bơi lội, lặn biển. Tối xem show Alcazar.", meals: ["Sáng", "Trưa", "Tối"], image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400" },
                    { day: 3, title: "Pattaya - Bangkok", description: "Trở về Bangkok, tham quan chùa Phật Vàng, chùa Phật Ngọc.", meals: ["Sáng", "Trưa", "Tối"], image: "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=400" },
                    { day: 4, title: "Hoàng Cung - Shopping", description: "Tham quan Hoàng Cung, mua sắm tại Platinum, MBK.", meals: ["Sáng", "Trưa"], image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400" },
                    { day: 5, title: "Bangkok - HCM", description: "Tự do mua sắm, bay về Việt Nam.", meals: ["Sáng"], image: "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=400" }
                ],
                included_services_detail: { transport: "Vé máy bay khứ hồi + xe du lịch điều hòa.", accommodation: "Khách sạn 4 sao, 2 khách/phòng.", meals: "Các bữa ăn theo chương trình.", guide: "HDV tiếng Việt suốt tuyến.", extras: ["Vé tham quan theo chương trình.", "Bảo hiểm du lịch quốc tế."] },
                excluded_services: ["Hộ chiếu còn hạn 6 tháng.", "Chi phí cá nhân.", "Tiền tip HDV và lái xe: 5 USD/khách/ngày.", "Phí visa (nếu có).", "Nâng cấp phòng đơn."],
                images: ["https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200", "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1600"
            },
            {
                name: "Tour Nhật Bản: Tokyo - Núi Phú Sĩ - Osaka 6N5Đ",
                tour_code: "JP-TKO-6N5D-01",
                description: "Chiêm ngưỡng núi Phú Sĩ hùng vĩ, khám phá Tokyo hiện đại với Shibuya, Akihabara. Osaka với lâu đài cổ kính, Kyoto với đền Fushimi Inari nghìn cổng Torii đỏ. Trải nghiệm văn hóa Nhật: mặc Kimono, trà đạo, ẩm thực Sushi, Ramen.",
                country_id: createdCountries["Nhật Bản"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 32900000,
                child_price: 28900000,
                duration_days: 6,
                rating: 4.9,
                departure_dates: generateDepartureDates(8),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                itinerary: [
                    { day: 1, title: "HCM - Tokyo", description: "Bay đến Tokyo, nhận phòng khách sạn.", meals: [], image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400" },
                    { day: 2, title: "Tokyo - Núi Phú Sĩ", description: "Tham quan núi Phú Sĩ, trạm số 5, làng Oshino Hakkai.", meals: ["Sáng", "Trưa", "Tối"], image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400" },
                    { day: 3, title: "Tokyo City Tour", description: "Shibuya, Harajuku, Akihabara, Tokyo Skytree.", meals: ["Sáng", "Trưa"], image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400" },
                    { day: 4, title: "Tokyo - Kyoto", description: "Đi tàu Shinkansen, đền Fushimi Inari, rừng tre Arashiyama.", meals: ["Sáng", "Trưa", "Tối"], image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400" },
                    { day: 5, title: "Osaka", description: "Lâu đài Osaka, Dotonbori, mua sắm Shinsaibashi.", meals: ["Sáng", "Trưa"], image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400" },
                    { day: 6, title: "Osaka - HCM", description: "Tự do mua sắm, bay về Việt Nam.", meals: ["Sáng"], image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400" }
                ],
                included_services_detail: { transport: "Vé máy bay khứ hồi + tàu Shinkansen + xe du lịch.", accommodation: "Khách sạn 3-4 sao.", meals: "Các bữa ăn theo chương trình.", guide: "HDV tiếng Việt.", extras: ["Vé tham quan.", "Bảo hiểm du lịch quốc tế 50.000 USD."] },
                excluded_services: ["Visa Nhật Bản (tự xin hoặc hỗ trợ phí dịch vụ).", "Tiền tip: 7 USD/khách/ngày.", "Chi phí cá nhân."],
                images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600"
            },
            {
                name: "Tour Hàn Quốc: Seoul - Nami - Everland 5N4Đ",
                tour_code: "KR-SEL-5N4D-01",
                description: "Khám phá Seoul hiện đại với Myeongdong, Gangnam sầm uất. Đảo Nami lãng mạn - bối cảnh phim Bản Tình Ca Mùa Đông. Công viên Everland vui nhộn. Trải nghiệm mặc Hanbok, K-beauty, ẩm thực BBQ Hàn Quốc.",
                country_id: createdCountries["Hàn Quốc"]._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 18900000,
                child_price: 15900000,
                duration_days: 5,
                rating: 4.8,
                departure_dates: generateDepartureDates(10),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200", "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1600"
            },
            {
                name: "Tour Singapore - Malaysia 5N4Đ",
                tour_code: "SG-MY-5N4D-01",
                description: "Khám phá Singapore hiện đại với Marina Bay Sands, Gardens by the Bay, Sentosa. Malaysia với thủ đô Kuala Lumpur, tháp đôi Petronas, Genting Highlands.",
                country_id: createdCountries["Singapore"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 12900000,
                child_price: 10900000,
                duration_days: 5,
                rating: 4.7,
                departure_dates: generateDepartureDates(12),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200", "https://images.unsplash.com/photo-1496939376851-89342e90adcd?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600"
            },
            {
                name: "Tour Trung Quốc: Bắc Kinh - Vạn Lý Trường Thành 5N4Đ",
                tour_code: "CN-BJ-5N4D-01",
                description: "Chiêm ngưỡng Vạn Lý Trường Thành hùng vĩ, Tử Cấm Thành bí ẩn, Thiên An Môn lịch sử. Thưởng thức vịt quay Bắc Kinh, trà Trung Hoa.",
                country_id: createdCountries["Trung Quốc"]._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 15900000,
                child_price: 12900000,
                duration_days: 5,
                rating: 4.6,
                departure_dates: generateDepartureDates(8),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200", "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600"
            },
            {
                name: "Tour Bali - Indonesia 4N3Đ",
                tour_code: "ID-BALI-4N3D-01",
                description: "Thiên đường nghỉ dưỡng Bali với đền Tanah Lot trên biển, ruộng bậc thang Tegallalang xanh mướt, núi lửa Kintamani. Spa Bali nổi tiếng thế giới.",
                country_id: createdCountries["Indonesia"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 11900000,
                child_price: 9900000,
                duration_days: 4,
                rating: 4.8,
                departure_dates: generateDepartureDates(10),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200", "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600"
            },
            {
                name: "Tour Dubai - Abu Dhabi 6N5Đ",
                tour_code: "AE-DXB-6N5D-01",
                description: "Khám phá Dubai xa hoa với Burj Khalifa cao nhất thế giới, Palm Jumeirah, sa mạc Safari. Abu Dhabi với thánh đường Sheikh Zayed trắng tinh khôi.",
                country_id: createdCountries["UAE"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 28900000,
                child_price: 24900000,
                duration_days: 6,
                rating: 4.9,
                departure_dates: generateDepartureDates(6),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200", "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600"
            },
            {
                name: "Tour Pháp: Paris - Lâu Đài Loire 7N6Đ",
                tour_code: "FR-PAR-7N6D-01",
                description: "Kinh đô ánh sáng Paris với tháp Eiffel lãng mạn, bảo tàng Louvre, Khải Hoàn Môn. Thung lũng Loire với các lâu đài cổ tích Chambord, Chenonceau.",
                country_id: createdCountries["Pháp"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 52900000,
                child_price: 45900000,
                duration_days: 7,
                rating: 4.9,
                departure_dates: generateDepartureDates(4),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200", "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600"
            },
            {
                name: "Tour Ý: Roma - Florence - Venice 8N7Đ",
                tour_code: "IT-ROM-8N7D-01",
                description: "Khám phá Italia với Roma cổ đại: Colosseum, Vatican. Florence nghệ thuật Phục Hưng. Venice lãng mạn với kênh đào, thuyền gondola.",
                country_id: createdCountries["Ý"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 58900000,
                child_price: 49900000,
                duration_days: 8,
                rating: 4.9,
                departure_dates: generateDepartureDates(4),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200", "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600"
            },
            {
                name: "Tour Thổ Nhĩ Kỳ: Istanbul - Cappadocia 9N8Đ",
                tour_code: "TR-IST-9N8D-01",
                description: "Khám phá ngã ba châu lục với Istanbul cổ kính: Hagia Sophia, Blue Mosque. Cappadocia kỳ ảo với khinh khí cầu, thành phố ngầm.",
                country_id: createdCountries["Thổ Nhĩ Kỳ"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 42900000,
                child_price: 36900000,
                duration_days: 9,
                rating: 4.8,
                departure_dates: generateDepartureDates(6),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200", "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1600"
            },
            {
                name: "Tour Ai Cập: Cairo - Kim Tự Tháp - Luxor 8N7Đ",
                tour_code: "EG-CAI-8N7D-01",
                description: "Khám phá xứ sở Pharaoh với Kim Tự Tháp Giza kỳ vĩ, tượng Nhân Sư bí ẩn. Du thuyền sông Nile, đền Karnak, Thung lũng các vị Vua.",
                country_id: createdCountries["Ai Cập"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 45900000,
                child_price: 39900000,
                duration_days: 8,
                rating: 4.7,
                departure_dates: generateDepartureDates(4),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200", "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1600"
            },
            {
                name: "Tour Malaysia: Kuala Lumpur - Langkawi 5N4Đ",
                tour_code: "MY-KUL-5N4D-01",
                description: "Tháp đôi Petronas biểu tượng Malaysia, động Batu Hindu linh thiêng. Đảo Langkawi thiên đường biển với cáp treo Sky Bridge.",
                country_id: createdCountries["Malaysia"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 10900000,
                child_price: 8900000,
                duration_days: 5,
                rating: 4.6,
                departure_dates: generateDepartureDates(10),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200", "https://images.unsplash.com/photo-1508062878650-88b52897f298?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600"
            },
            {
                name: "Tour Thái Lan: Chiang Mai - Chiang Rai 4N3Đ",
                tour_code: "TH-CNX-4N3D-01",
                description: "Miền Bắc Thái Lan với chùa Doi Suthep linh thiêng, chùa Trắng Chiang Rai độc đáo. Trải nghiệm văn hóa Lanna, chợ đêm Night Bazaar.",
                country_id: createdCountries["Thái Lan"]._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 7990000,
                child_price: 5990000,
                duration_days: 4,
                rating: 4.7,
                departure_dates: generateDepartureDates(10),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200", "https://images.unsplash.com/photo-1512553860339-9dc76c3fd600?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600"
            },
            {
                name: "Tour Trung Quốc: Thượng Hải - Hàng Châu - Tô Châu 5N4Đ",
                tour_code: "CN-SHA-5N4D-01",
                description: "Thượng Hải hiện đại với The Bund, Đông Phương Minh Châu. Hàng Châu với Tây Hồ thơ mộng. Tô Châu - Venice phương Đông với vườn cổ điển.",
                country_id: createdCountries["Trung Quốc"]._id,
                departure_location_id: createdDepartureLocations["TP. Hồ Chí Minh"]._id,
                adult_price: 14900000,
                child_price: 11900000,
                duration_days: 5,
                rating: 4.6,
                departure_dates: generateDepartureDates(8),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=1200", "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=1600"
            },
            {
                name: "Tour Nhật Bản: Hokkaido Mùa Tuyết 6N5Đ",
                tour_code: "JP-HKD-6N5D-01",
                description: "Hokkaido tuyết trắng với lễ hội tuyết Sapporo, trượt tuyết Niseko, suối nước nóng Noboribetsu. Otaru lãng mạn với kênh đào, đồng hồ hơi nước.",
                country_id: createdCountries["Nhật Bản"]._id,
                departure_location_id: createdDepartureLocations["Hà Nội"]._id,
                adult_price: 38900000,
                child_price: 32900000,
                duration_days: 6,
                rating: 4.9,
                departure_dates: generateDepartureDates(6),
                included_services: [createdServices["Bữa sáng buffet"]._id, createdServices["Bữa trưa trọn gói"]._id, createdServices["Đưa đón sân bay"]._id, createdServices["Hướng dẫn viên tiếng Việt"]._id, createdServices["Bảo hiểm du lịch"]._id],
                images: ["https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1200", "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200"],
                banner_url: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1600"
            }
        ];

        for (const tourData of toursData) {
            let existing = await Tour.findOne({ name: tourData.name });
            if (!existing) {
                await Tour.create(tourData);
                console.log(`🎫 Created tour: ${tourData.name}`);
            } else {
                await Tour.findByIdAndUpdate(existing._id, { $set: tourData });
                console.log(`🔄 Updated tour: ${tourData.name}`);
            }
        }

        console.log(`✅ Tours seeded successfully!`);
        
        // Seed transports (buses and airport transfers)
        console.log("🚌 Seeding transports...");
        await seedTransports();
        
        // Seed airports and flights
        console.log("✈️ Seeding airports and flights...");
        await seedAirportsAndFlights();
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedDatabase();
