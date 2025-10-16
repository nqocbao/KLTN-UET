"use client";

interface ChartProps {
  title: string;
  subtitle?: string;
  data?: any[];
}

export default function Chart({ title, subtitle, data = [] }: ChartProps) {
  // Mock data for visualization
  const chartData = data.length > 0 ? data : [65, 75, 70, 80, 85, 90, 95];
  const maxValue = Math.max(...chartData);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between h-64 space-x-2">
        {chartData.map((value, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-end"
          >
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
              style={{
                height: `${(value / maxValue) * 100}%`,
              }}
            ></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index] ||
                `Day ${index + 1}`}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-6 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Current Period
          </span>
        </div>
      </div>
    </div>
  );
}
