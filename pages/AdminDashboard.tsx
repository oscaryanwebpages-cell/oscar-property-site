import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Home,
  Package,
  DollarSign,
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useStore } from "../store";
import { getListings, getAllListings } from "../services/firebase";
import { getAnalyticsOverviewReal, getPopularListings, getListingStats, getMultipleListingStats, Listing } from "../services/analyticsService";
import { ListingStatus } from "../types";

// Simple chart components (CSS-based, no external charting library)
const LineChart: React.FC<{ data: Array<{ date: string; value: number }> }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min;

  return (
    <div className="relative h-48 w-full">
      <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
          <line
            key={percent}
            x1="0"
            y1={percent * 180 + 10}
            x2="400"
            y2={percent * 180 + 10}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Data line */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          points={data
            .map((d, i) => {
              const x = (i / (data.length - 1)) * 400;
              const normalizedValue = (d.value - min) / range;
              const y = 180 - normalizedValue * 170 + 10;
              return `${x},${y}`;
            })
            .join(" ")}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 400;
          const normalizedValue = (d.value - min) / range;
          const y = 180 - normalizedValue * 170 + 10;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#f59e0b"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{d.date}: {d.value} views</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
};

const DonutChart: React.FC<{ data: Array<{ label: string; value: number; color: string }> }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const segments = data.map((d) => {
    const percentage = (d.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    // Convert to SVG path
    const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
    const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
    const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
    const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));

    const largeArcFlag = angle > 180 ? 1 : 0;

    return {
      ...d,
      percentage,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {segments.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{s.label}: {s.value} ({s.percentage.toFixed(1)}%)</title>
          </path>
        ))}
      </svg>
      <div className="space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-gray-700">
              {s.label}: {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: Array<{ label: string; value: number; color: string }> }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-24 text-sm text-gray-700">{d.label}</div>
          <div className="flex-1 h-8 bg-gray-100 rounded-sm overflow-hidden relative">
            <div
              className="h-full rounded-sm transition-all duration-500"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color,
              }}
            />
          </div>
          <div className="w-12 text-right text-sm font-medium text-gray-700">{d.value}</div>
        </div>
      ))}
    </div>
  );
};

interface DashboardOverview {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  engagementRate: number;
}

interface RecentActivity {
  id: string;
  type: "created" | "updated" | "status_changed";
  listingTitle: string;
  timestamp: Date;
  details: string;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [popularListings, setPopularListings] = useState<Array<{ listing: Listing; viewCount: number; rank: number }>>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [viewsOverTime, setViewsOverTime] = useState<Array<{ date: string; value: number }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load overview stats
      const overviewData = await getAnalyticsOverviewReal();
      setOverview(overviewData);

      // Load popular listings
      const popular = await getPopularListings(10);
      setPopularListings(popular);

      // Load all listings for recent activity and status distribution
      const allListings = await getAllListings();
      const stats = await getMultipleListingStats(allListings.map((l) => l.id));

      // Generate recent activity (mock - would come from Firestore in real implementation)
      const activity: RecentActivity[] = allListings
        .slice(0, 5)
        .map((listing) => ({
          id: listing.id,
          type: "updated",
          listingTitle: listing.title,
          timestamp: new Date(), // Would use actual updatedAt from Firestore
          details: `Last updated: ${listing.status || "active"}`,
        }));
      setRecentActivity(activity);

      // Generate status distribution
      const statusCounts: Record<string, number> = { active: 0, inactive: 0, sold: 0 };
      allListings.forEach((listing) => {
        const status = listing.status || "active";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      setStatusDistribution([
        { label: "Active", value: statusCounts.active, color: "#10b981" },
        { label: "Inactive", value: statusCounts.inactive, color: "#f59e0b" },
        { label: "Sold", value: statusCounts.sold, color: "#6b7280" },
      ]);

      // Generate mock views over time (last 30 days)
      const mockViews: Array<{ date: string; value: number }> = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        mockViews.push({
          date: date.toISOString().split("T")[0].substring(5),
          value: Math.floor(Math.random() * 100) + 20,
        });
      }
      setViewsOverTime(mockViews);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <BarChart3 size={28} className="text-accent" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600">Performance insights and statistics</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
            >
              <Edit size={18} />
              Manage Listings
            </a>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm transition-colors"
            >
              <Home size={18} />
              View Site
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-sm shadow-sm p-6 border-l-4 border-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Listings</p>
                  <p className="text-3xl font-bold text-primary">{overview.totalListings}</p>
                </div>
                <Package size={24} className="text-accent" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-gray-600">Active: {overview.activeListings}</span>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-primary">{overview.activeListings}</p>
                </div>
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {((overview.activeListings / overview.totalListings) * 100).toFixed(1)}% of total
                </span>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm p-6 border-l-4 border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sold This Month</p>
                  <p className="text-3xl font-bold text-primary">{overview.soldListings}</p>
                </div>
                <DollarSign size={24} className="text-gray-600" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <ArrowUp size={16} className="text-green-600" />
                <span className="text-gray-600">vs last month</span>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-primary">{overview.totalViews.toLocaleString()}</p>
                </div>
                <Eye size={24} className="text-blue-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-600">Engagement: {overview.engagementRate}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Views Over Time */}
          <div className="bg-white rounded-sm shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-primary mb-4">Views Over Time (Last 30 Days)</h3>
            <LineChart data={viewsOverTime} />
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-sm shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Status Distribution</h3>
            <DonutChart data={statusDistribution} />
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-primary">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.listingTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-sm bg-blue-100 text-blue-800">
                        {activity.type.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.timestamp.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Listings Table */}
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-primary">Most Viewed Listings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularListings.map((item) => (
                  <tr key={item.listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm">
                        #{item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.listing.title}</div>
                      <div className="text-sm text-gray-500">
                        RM {item.listing.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.listing.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {item.viewCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`/listings/${item.listing.id}`}
                        className="text-accent hover:text-accent-hover"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
