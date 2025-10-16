import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
  return (
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={cn(
                    "text-xs font-semibold",
                    activity.type === "create" &&
                      "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                    activity.type === "update" &&
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                    activity.type === "delete" &&
                      "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                    activity.type === "view" &&
                      "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                  )}
                >
                  {activity.user[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
