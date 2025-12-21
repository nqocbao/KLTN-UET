'use client';

import { useState } from 'react';

const DESTINATION_DATA = {
  Seoul: {
    hotels: [
      { name: "Hotel Skypark Dongdaemun I", location: "Seoul", rating: 8.6, reviews: 1883, price: "4,527,019", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" },
      { name: "Hotel Skypark Central Myeongdong", location: "Seoul", rating: 8.7, reviews: 1525, price: "4,413,517", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop" },
      { name: "Hotel Skypark Kingstown Dongdaemun", location: "Seoul", rating: 9.0, reviews: 2354, price: "4,441,069", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop" },
    ],
    transports: [
      { from: "Hà Nội", to: "Seoul", date: "28/12 - 10/01", price: "5,023,000", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop" },
      { from: "Seoul", to: "Jeonju", date: "21/12", price: "666,567", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop" },
      { from: "Seoul", to: "Daegu", date: "21/12", price: "407,223", img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop" },
    ],
    sights: [
      { name: "N Seoul Tower", rating: 4.6, reviews: 7491, img: "https://i.pinimg.com/736x/4f/95/74/4f9574ba5ef3a2936845a1bb60d46962.jpg" },
      { name: "Namsan Mountain Park", rating: 4.7, reviews: 1277, img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop" },
      { name: "Myeong-dong", rating: 4.4, reviews: 4444, img: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=400&fit=crop" },
    ],
    moments: [
      { desc: "Thưởng thức ẩm thực đường phố tại Myeong-dong.", img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop" },
      { desc: "Ngắm thành phố từ N Seoul Tower.", img: "https://i.pinimg.com/736x/fd/53/64/fd5364bbe9e2888cf5ba4087805b9126.jpg" },
      { desc: "Dạo chơi công viên Namsan mùa thu.", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop" },
      { desc: "Khám phá cung điện Gyeongbokgung.", img: "https://images.unsplash.com/photo-1555217851-6141535bd771?w=400&h=300&fit=crop" },
    ],
  },
  Osaka: {
    hotels: [
      { name: "Osaka Bay Tower", location: "Osaka", rating: 8.5, reviews: 1200, price: "3,900,000", img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop" },
      { name: "Namba Oriental Hotel", location: "Osaka", rating: 8.8, reviews: 980, price: "4,200,000", img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop" },
      { name: "Hotel Monterey Grasmere", location: "Osaka", rating: 8.9, reviews: 1100, price: "4,500,000", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop" },
    ],
    transports: [
      { from: "Tokyo", to: "Osaka", date: "08/01", price: "750,000", img: "https://images.unsplash.com/photo-1570126646281-5ec88111777f?w=600&h=400&fit=crop" },
      { from: "Osaka", to: "Kyoto", date: "09/01", price: "300,000", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=400&fit=crop" },
      { from: "Osaka", to: "Kobe", date: "10/01", price: "250,000", img: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&h=400&fit=crop" },
    ],
    sights: [
      { name: "Osaka Castle", rating: 4.8, reviews: 9000, img: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&h=400&fit=crop" },
      { name: "Dotonbori", rating: 4.7, reviews: 8500, img: "https://images.unsplash.com/photo-1555217851-6141535bd771?w=600&h=400&fit=crop" },
      { name: "Universal Studios Japan", rating: 4.9, reviews: 12000, img: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&h=400&fit=crop" },
    ],
    moments: [
      { desc: "Check-in tại lâu đài Osaka.", img: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop" },
      { desc: "Thưởng thức takoyaki tại Dotonbori.", img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop" },
      { desc: "Vui chơi tại Universal Studios Japan.", img: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=400&h=300&fit=crop" },
      { desc: "Dạo phố đêm Namba.", img: "https://images.unsplash.com/photo-1555217851-6141535bd771?w=400&h=300&fit=crop" },
    ],
  },
  "Vinh City": {
    hotels: [
      { name: "Mường Thanh Luxury Song Lam", location: "Vinh City", rating: 8.9, reviews: 850, price: "1,150,000", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" },
      { name: "Sai Gon Kim Lien Hotel", location: "Vinh City", rating: 8.5, reviews: 420, price: "950,000", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop" },
      { name: "Lam Giang Hotel", location: "Vinh City", rating: 8.2, reviews: 310, price: "750,000", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop" },
    ],
    transports: [
      { from: "Hà Nội", to: "Vinh", date: "29/12", price: "250,000", img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=400&fit=crop" },
      { from: "TP. HCM", to: "Vinh", date: "30/12", price: "1,200,000", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop" },
      { from: "Đà Nẵng", to: "Vinh", date: "28/12", price: "400,000", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop" },
    ],
    sights: [
      { name: "Biển Cửa Lò", rating: 4.6, reviews: 2500, img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" },
      { name: "Quê Bác (Kim Liên)", rating: 4.9, reviews: 5000, img: "https://images.unsplash.com/photo-1528127222440-d67b25009c5b?w=600&h=400&fit=crop" },
      { name: "Đồi chè Thanh Chương", rating: 4.7, reviews: 1200, img: "https://images.unsplash.com/photo-1586617065096-7c05b81aCl1g?w=600&h=400&fit=crop" },
    ],
    moments: [
      { desc: "Tắm biển và ăn hải sản tại Cửa Lò.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop" },
      { desc: "Về thăm quê Bác xúc động.", img: "https://images.unsplash.com/photo-1616486029423-aaa2789766f0?w=400&h=300&fit=crop" },
      { desc: "Thưởng thức đặc sản cháo lươn.", img: "https://images.unsplash.com/photo-1634734685714-d02324dc54c4?w=400&h=300&fit=crop" },
      { desc: "Check-in đồi chè xanh mướt.", img: "https://images.unsplash.com/photo-1586617065096-7c05b81aCl1g?w=400&h=300&fit=crop" },
    ],
  },
  "Beijing": {
    hotels: [
      { name: "The Peninsula Beijing", location: "Beijing", rating: 9.3, reviews: 1800, price: "6,500,000", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" },
      { name: "Rosewood Beijing", location: "Beijing", rating: 9.5, reviews: 1200, price: "7,200,000", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop" },
      { name: "New World Beijing Hotel", location: "Beijing", rating: 8.8, reviews: 2100, price: "4,100,000", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop" },
    ],
    transports: [
      { from: "Hà Nội", to: "Beijing", date: "15/01", price: "5,500,000", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop" },
      { from: "Shanghai", to: "Beijing", date: "16/01", price: "1,800,000", img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=400&fit=crop" },
      { from: "Beijing", to: "Tianjin", date: "17/01", price: "300,000", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop" },
    ],
    sights: [
      { name: "Great Wall of China", rating: 4.9, reviews: 15000, img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=400&fit=crop" },
      { name: "Forbidden City", rating: 4.8, reviews: 12000, img: "https://images.unsplash.com/photo-1599827670608-89c09c25e368?w=600&h=400&fit=crop" },
      { name: "Temple of Heaven", rating: 4.7, reviews: 8000, img: "https://images.unsplash.com/photo-1559607627-521b449bdf5c?w=600&h=400&fit=crop" },
    ],
    moments: [
      { desc: "Chinh phục Vạn Lý Trường Thành.", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop" },
      { desc: "Thưởng thức Vịt Quay Bắc Kinh.", img: "https://images.unsplash.com/photo-1631526615953-ad477543883a?w=400&h=300&fit=crop" },
      { desc: "Dạo quanh các Hutong cổ kính.", img: "https://images.unsplash.com/photo-1547048701-443376ae75cb?w=400&h=300&fit=crop" },
      { desc: "Thăm Tử Cấm Thành.", img: "https://images.unsplash.com/photo-1599827670608-89c09c25e368?w=400&h=300&fit=crop" },
    ],
  },
  "Hong Kong": {
    hotels: [
      { name: "The Ritz-Carlton Hong Kong", location: "Hong Kong", rating: 9.6, reviews: 2000, price: "9,800,000", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" },
      { name: "Four Seasons Hotel Hong Kong", location: "Hong Kong", rating: 9.5, reviews: 1500, price: "8,900,000", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop" },
      { name: "Mandarin Oriental Hong Kong", location: "Hong Kong", rating: 9.4, reviews: 1800, price: "8,500,000", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop" },
    ],
    transports: [
      { from: "Hà Nội", to: "Hong Kong", date: "20/01", price: "4,500,000", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop" },
      { from: "Hong Kong", to: "Macau", date: "22/01", price: "800,000", img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=400&fit=crop" },
      { from: "TP. HCM", to: "Hong Kong", date: "21/01", price: "4,200,000", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop" },
    ],
    sights: [
      { name: "Victoria Peak", rating: 4.8, reviews: 9000, img: "https://images.unsplash.com/photo-1506318137071-a8bcbf6b925d?w=600&h=400&fit=crop" },
      { name: "Hong Kong Disneyland", rating: 4.7, reviews: 12000, img: "https://images.unsplash.com/photo-1510265119258-db115b0e8172?w=600&h=400&fit=crop" },
      { name: "Tian Tan Buddha", rating: 4.6, reviews: 5000, img: "https://images.unsplash.com/photo-1536410381576-963d7675f2c2?w=600&h=400&fit=crop" },
    ],
    moments: [
      { desc: "Ngắm cảng Victoria về đêm.", img: "https://images.unsplash.com/photo-1506318137071-a8bcbf6b925d?w=400&h=300&fit=crop" },
      { desc: "Đi tàu điện Star Ferry.", img: "https://images.unsplash.com/photo-1554477284-81498ec517ad?w=400&h=300&fit=crop" },
      { desc: "Thưởng thức Dim Sum truyền thống.", img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop" },
      { desc: "Dạo phố đêm Lan Quế Phường.", img: "https://images.unsplash.com/photo-1536585710631-f925b6a71cb0?w=400&h=300&fit=crop" },
    ],
  },
};

const DESTINATIONS = [
  { key: "Seoul", label: "Seoul", img: "https://i.pinimg.com/736x/63/36/ae/6336ae671149dace0a4c743e93ea67c7.jpg", tag: "Viewed" },
  { key: "Osaka", label: "Osaka", img: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&h=400&fit=crop", tag: "Hot" },
  { key: "Vinh City", label: "Vinh City", img: "https://i.pinimg.com/1200x/f1/b5/43/f1b5431d81a0780bdad94228b78f3dcb.jpg", tag: "New" },
  { key: "Beijing", label: "Beijing", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=400&fit=crop", tag: "Popular" },
  { key: "Hong Kong", label: "Hong Kong", img: "https://i.pinimg.com/1200x/12/36/51/123651178582dfe91bcbeb6a4ff922b5.jpg", tag: "Trending" },
];

export function HomeDynamicSection() {
  const [selected, setSelected] = useState<keyof typeof DESTINATION_DATA>("Seoul");
  const data = DESTINATION_DATA[selected];

  return (
    <>
      <section className="container mx-auto md:px-40 px-20 py-12">
        <h2 className="text-3xl font-bold mb-6">Get inspired for your next trip</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide p-4">
            {DESTINATIONS.map((d) => (
              <div
                key={d.key}
                className={`relative rounded-2xl min-w-[260px] h-48 cursor-pointer transition-all duration-300 flex-shrink-0 group ${selected === d.key ? "ring-4 ring-blue-500" : "hover:ring-2 hover:ring-gray-300"}`}
                onClick={() => setSelected(d.key as keyof typeof DESTINATION_DATA)}
                style={{ backgroundImage: `url(${d.img})`, backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">{d.tag}</div>
                <div className="absolute bottom-4 left-4 text-white text-2xl font-bold drop-shadow-lg">{d.label}</div>
              </div>
            ))}
          </div>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      <section className="container mx-auto md:px-40 px-20 py-12">
        <h2 className="text-2xl font-bold mb-6">Khám phá khách sạn nổi bật tại {selected}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.hotels.map((hotel) => (
            <div key={hotel.name} className="rounded-lg shadow p-4 bg-white">
              <img src={hotel.img} alt={hotel.name} className="rounded-md object-cover w-full h-48" />
              <div className="mt-3">
                <div className="font-semibold">{hotel.name}</div>
                <div className="text-sm text-gray-500">{hotel.location}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500">★ {hotel.rating}</span>
                  <span className="text-xs text-gray-400">({hotel.reviews} đánh giá)</span>
                </div>
                <div className="mt-2 font-bold text-blue-600">Từ {hotel.price} VND</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto md:px-40 px-20 py-12">
        <h2 className="text-2xl font-bold mb-6">Di chuyển dễ dàng tại {selected}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.transports.map((t, idx) => (
            <div key={idx} className="rounded-lg shadow p-4 bg-white">
              <img src={t.img} alt={`${t.from} - ${t.to}`} className="rounded-md object-cover w-full h-48" />
              <div className="mt-3">
                <div className="font-semibold">{t.from} ⇄ {t.to}</div>
                <div className="text-sm text-gray-500">{t.date}</div>
                <div className="mt-2 font-bold text-blue-600">Từ {t.price} VND</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto md:px-40 px-20 py-12">
        <h2 className="text-2xl font-bold mb-6">Gợi ý điểm đến nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.sights.map((sight) => (
            <div key={sight.name} className="rounded-lg shadow p-4 bg-white">
              <img src={sight.img} alt={sight.name} className="rounded-md object-cover w-full h-48" />
              <div className="mt-3">
                <div className="font-semibold">{sight.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500">★ {sight.rating}</span>
                  <span className="text-xs text-gray-400">({sight.reviews} đánh giá)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto md:px-40 px-20 py-12">
        <h2 className="text-2xl font-bold mb-6">Khoảnh khắc đáng nhớ tại {selected}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {data.moments.map((moment, idx) => (
            <div key={idx} className="rounded-lg shadow p-4 bg-white flex flex-col items-center">
              <img src={moment.img} alt={moment.desc} className="rounded-md object-cover w-full h-32" />
              <div className="mt-2 text-center text-sm">{moment.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
