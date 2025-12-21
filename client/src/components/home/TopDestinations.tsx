"use client";

const destinations = [
  {
    id: 1,
    name: "Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Hà Nội",
    image: "https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Vũng Tàu",
    image: "https://i.pinimg.com/1200x/4b/3f/b9/4b3fb9fc016382fe6efd1b9632e1d8b2.jpg",
  },
  {
    id: 4,
    name: "Đà Nẵng",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Đà Lạt",
    image: "https://i.pinimg.com/736x/7e/92/a3/7e92a3a332bb71af1ce2c9ded6cdfd1b.jpg",
  },
];

export function TopDestinations() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Các điểm đến thu hút nhất Việt Nam
        </h2>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {destinations.map((dest) => (
            <div 
              key={dest.id} 
              className="min-w-[200px] md:min-w-[240px] h-[200px] md:h-[240px] rounded-xl overflow-hidden relative cursor-pointer group shadow-md"
            >
              <img 
                src={dest.image} 
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white font-bold text-lg">{dest.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
