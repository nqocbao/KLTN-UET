import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

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
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Top Destinations</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground font-bold rounded-lg">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="font-semibold">{destination.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {destination.country}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{destination.revenue}</span>
                  {destination.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {destination.bookings} bookings
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
