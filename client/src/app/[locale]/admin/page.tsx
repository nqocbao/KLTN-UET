import StatCard from "@/components/admin/StatCard";
import Chart from "@/components/admin/Chart";
import RecentActivity from "@/components/admin/RecentActivity";
import TopDestinations from "@/components/admin/TopDestinations";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Hotel, BarChart3, Settings } from "lucide-react";

export default function AdminDashboard() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {tCommon("welcome")}! Here&apos;s what&apos;s happening with your
          travel business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("totalBookings")}
          value="12,543"
          change="+12.5% from last month"
          changeType="positive"
          icon="📅"
          color="blue"
        />
        <StatCard
          title={t("totalRevenue")}
          value="$248,560"
          change="+8.2% from last month"
          changeType="positive"
          icon="💰"
          color="green"
        />
        <StatCard
          title={t("totalTours")}
          value="245"
          change="+5 new tours"
          changeType="positive"
          icon="✈️"
          color="purple"
        />
        <StatCard
          title={t("totalUsers")}
          value="8,543"
          change="+201 this week"
          changeType="positive"
          icon="👥"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          title={t("bookingStats")}
          subtitle={t("last7Days")}
          data={[45, 52, 48, 65, 70, 68, 75]}
        />
        <Chart
          title={t("salesChart")}
          subtitle="Weekly revenue comparison"
          data={[30, 45, 40, 55, 60, 58, 65]}
        />
      </div>

      {/* Activity and Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <TopDestinations />
      </div>

      {/* Quick Actions */}
      <Card className="border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              <Plus className="h-8 w-8 mb-2 text-blue-600" />
              <h4 className="font-semibold text-left">Add New Tour</h4>
              <p className="text-sm text-muted-foreground mt-1 text-left">
                Create a new tour package
              </p>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start hover:bg-green-50 dark:hover:bg-green-950/50"
            >
              <Hotel className="h-8 w-8 mb-2 text-green-600" />
              <h4 className="font-semibold text-left">Add Hotel</h4>
              <p className="text-sm text-muted-foreground mt-1 text-left">
                Register new accommodation
              </p>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start hover:bg-purple-50 dark:hover:bg-purple-950/50"
            >
              <BarChart3 className="h-8 w-8 mb-2 text-purple-600" />
              <h4 className="font-semibold text-left">View Reports</h4>
              <p className="text-sm text-muted-foreground mt-1 text-left">
                Generate analytics reports
              </p>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start hover:bg-orange-50 dark:hover:bg-orange-950/50"
            >
              <Settings className="h-8 w-8 mb-2 text-orange-600" />
              <h4 className="font-semibold text-left">Settings</h4>
              <p className="text-sm text-muted-foreground mt-1 text-left">
                Manage system settings
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
