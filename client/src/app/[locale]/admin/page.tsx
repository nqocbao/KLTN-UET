import StatCard from "@/components/admin/StatCard";
import Chart from "@/components/admin/Chart";
import RecentActivity from "@/components/admin/RecentActivity";
import TopDestinations from "@/components/admin/TopDestinations";
import { useTranslations } from "next-intl";

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
        <p className="text-gray-600 dark:text-gray-400">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-left transition-colors">
            <div className="text-2xl mb-2">➕</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Add New Tour
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create a new tour package
            </p>
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-left transition-colors">
            <div className="text-2xl mb-2">🏨</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Add Hotel
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Register new accommodation
            </p>
          </button>
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-left transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              View Reports
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate analytics reports
            </p>
          </button>
          <button className="p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg text-left transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Settings
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage system settings
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
