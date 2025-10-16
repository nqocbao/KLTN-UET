"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartProps {
  title: string;
  subtitle?: string;
  data?: number[];
}

export default function Chart({ title, subtitle, data = [] }: ChartProps) {
  // Mock data for visualization
  const chartData = data.length > 0 ? data : [65, 75, 70, 80, 85, 90, 95];
  const maxValue = Math.max(...chartData);

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between h-64 space-x-2">
          {chartData.map((value, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end"
            >
              <div
                className="w-full bg-gradient-to-t from-primary to-primary/80 rounded-t-lg transition-all hover:from-primary/90 hover:to-primary/70"
                style={{
                  height: `${(value / maxValue) * 100}%`,
                }}
              ></div>
              <span className="text-xs text-muted-foreground mt-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index] ||
                  `Day ${index + 1}`}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-6 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Current Period
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
