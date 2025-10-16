interface Destination {
  id: number;
  name: string;
  country: string;
  bookings: number;
  revenue: string;
  trend: "up" | "down";
}

const destinations: Destination[] = [
  {
    id: 1,
    name: "Ha Long Bay",
    country: "Vietnam",
    bookings: 1234,
    revenue: "$45,230",
    trend: "up",
  },
  {
    id: 2,
    name: "Bali",
    country: "Indonesia",
    bookings: 987,
    revenue: "$38,560",
    trend: "up",
  },
  {
    id: 3,
    name: "Phuket",
    country: "Thailand",
    bookings: 856,
    revenue: "$32,890",
    trend: "down",
  },
  {
    id: 4,
    name: "Tokyo",
    country: "Japan",
    bookings: 745,
    revenue: "$29,450",
    trend: "up",
  },
];

export default function TopDestinations() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Destinations
        </h3>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {destinations.map((destination, index) => (
          <div
            key={destination.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded-lg">
                #{index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {destination.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {destination.country}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {destination.revenue}
                </span>
                <span
                  className={`text-sm ${
                    destination.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {destination.trend === "up" ? "↑" : "↓"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {destination.bookings} bookings
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
