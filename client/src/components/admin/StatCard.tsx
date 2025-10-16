import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  const changeColorClasses = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="border-0 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-bold mb-2">{value}</h3>
            {change && (
              <p
                className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  changeColorClasses[changeType]
                )}
              >
                {changeType === "positive" && <ArrowUp className="h-4 w-4" />}
                {changeType === "negative" && <ArrowDown className="h-4 w-4" />}
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl",
                colorClasses[color]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
