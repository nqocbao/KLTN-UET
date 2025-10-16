interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "create" | "update" | "delete" | "view";
}

const activities: Activity[] = [
  {
    id: 1,
    user: "John Doe",
    action: "created",
    target: "New tour to Bali",
    time: "5 minutes ago",
    type: "create",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "updated",
    target: "Hanoi Hotel details",
    time: "15 minutes ago",
    type: "update",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "deleted",
    target: "Old restaurant listing",
    time: "1 hour ago",
    type: "delete",
  },
  {
    id: 4,
    user: "Sarah Wilson",
    action: "viewed",
    target: "User analytics report",
    time: "2 hours ago",
    type: "view",
  },
];

export default function RecentActivity() {
  const getTypeColor = (type: Activity["type"]) => {
    switch (type) {
      case "create":
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400";
      case "update":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
      case "delete":
        return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400";
      case "view":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getTypeColor(
                activity.type
              )}`}
            >
              {activity.user[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-semibold">{activity.user}</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {activity.action}
                </span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
