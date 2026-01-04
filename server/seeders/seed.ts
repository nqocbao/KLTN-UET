import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../models/hotels.model.js";
import Address from "../models/addresses.model.js";
import Destination from "../models/destinations.model.js";
import Country from "../models/countries.model.js";
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
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedDatabase();
