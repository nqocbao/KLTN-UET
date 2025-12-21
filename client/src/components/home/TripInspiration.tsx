'use client';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

const destinations = [
  {
    id: 1,
    name: 'Seoul',
    image: '/images/destinations/seoul.jpg',
    badge: 'Viewed',
    badgeColor: 'bg-blue-600'
  },
  {
    id: 2,
    name: 'Shenzhen',
    image: '/images/destinations/shenzhen.jpg',
    badge: 'Short haul',
    badgeColor: 'bg-cyan-400'
  },
  {
    id: 3,
    name: 'Osaka',
    image: '/images/destinations/osaka.jpg',
    badge: 'Medium haul',
    badgeColor: 'bg-blue-600'
  },
  {
    id: 4,
    name: 'Moscow',
    image: '/images/destinations/moscow.jpg',
    badge: 'Long haul',
    badgeColor: 'bg-gray-500'
  },
  {
    id: 5,
    name: 'Vinh City',
    image: '/images/destinations/vinh-city.jpg',
    badge: 'Short haul',
    badgeColor: 'bg-gray-500'
  }
];

export default function TripInspiration() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Get inspired for your next trip</h2>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="relative flex-shrink-0 w-64 h-48 rounded-2xl overflow-hidden cursor-pointer group"
            >
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className={`${destination.badgeColor} text-white text-xs px-3 py-1 rounded-full`}>
                  {destination.badge}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-2xl font-bold">{destination.name}</h3>
              </div>
            </div>
          ))}
        </div>

        <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
