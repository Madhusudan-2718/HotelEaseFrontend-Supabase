import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Card } from "../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import dashBanner from "../admin/imagess/dash.png";
import { adminApi } from "../../services/api";
import { useAppContext } from "../../context/AppContext";
import {
  DashboardStats,
  DepartmentTaskCount,
  RecentUpdate,
  DepartmentStatus,
} from "../../types";

export default function DashboardOverview() {
  const { subscribe } = useAppContext();
  const [stats, setStats] = useState<DashboardStats>({
    activeStaff: 0,
    pendingTasks: 0,
    completedToday: 0,
    ongoingRequests: 0,
  });
  const [departmentData, setDepartmentData] = useState<DepartmentTaskCount[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [departmentStatus, setDepartmentStatus] = useState<DepartmentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setStats({
          activeStaff: 6,
          pendingTasks: 2,
          completedToday: 5,
          ongoingRequests: 3,
        });
        setDepartmentData([
          { name: "Housekeeping", tasks: 12, color: "#6B8E23" },
          { name: "Restaurant", tasks: 8, color: "#FFD700" },
          { name: "Travel Desk", tasks: 5, color: "#1E90FF" },
        ]);
        setRecentUpdates([
          {
            id: "1",
            department: "Housekeeping",
            message: "Room 205 requested Turn-Down Service",
            time: "2 min ago",
            status: "assigned",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            department: "Restaurant",
            message: "Order #1024 prepared for Room 301",
            time: "10 min ago",
            status: "completed",
            createdAt: new Date().toISOString(),
          },
        ]);
        setDepartmentStatus([
          { name: "Housekeeping", busy: 3, available: 2, color: "#6B8E23" },
          { name: "Restaurant", busy: 4, available: 3, color: "#FFD700" },
          { name: "Travel Desk", busy: 2, available: 1, color: "#1E90FF" },
        ]);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === "restaurant_order_created") {
        const update: RecentUpdate = {
          id: Date.now().toString(),
          department: "Restaurant",
          message: `Order #${event.payload.orderNumber} placed from Room ${event.payload.roomNumber}`,
          time: "Just now",
          status: "assigned",
          createdAt: new Date().toISOString(),
        };
        setRecentUpdates((prev) => [update, ...prev].slice(0, 10));
        setStats((prev) => ({
          ...prev,
          pendingTasks: prev.pendingTasks + 1,
          ongoingRequests: prev.ongoingRequests + 1,
        }));
      }

      if (event.type === "housekeeping_request_created") {
        const update: RecentUpdate = {
          id: Date.now().toString(),
          department: "Housekeeping",
          message: `${event.payload.serviceType} requested for Room ${event.payload.roomNumber}`,
          time: "Just now",
          status: "assigned",
          createdAt: new Date().toISOString(),
        };
        setRecentUpdates((prev) => [update, ...prev].slice(0, 10));
        setStats((prev) => ({
          ...prev,
          pendingTasks: prev.pendingTasks + 1,
          ongoingRequests: prev.ongoingRequests + 1,
        }));
      }

      if (event.type === "travel_booking_created") {
        const update: RecentUpdate = {
          id: Date.now().toString(),
          department: "Travel Desk",
          message: `${event.payload.serviceType} booking ${event.payload.bookingId} from Room ${event.payload.roomNumber}`,
          time: "Just now",
          status: "assigned",
          createdAt: new Date().toISOString(),
        };
        setRecentUpdates((prev) => [update, ...prev].slice(0, 10));
        setStats((prev) => ({
          ...prev,
          pendingTasks: prev.pendingTasks + 1,
          ongoingRequests: prev.ongoingRequests + 1,
        }));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const statsData = [
    {
      label: "Active Staff",
      value: stats.activeStaff.toString(),
      icon: Users,
      color: "from-[#FFD700] to-[#FFA500]",
      change: "+2",
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      icon: Clock,
      color: "from-[#6B8E23] to-[#556B2F]",
      change: "-1",
    },
    {
      label: "Completed Today",
      value: stats.completedToday.toString(),
      icon: CheckCircle2,
      color: "from-blue-500 to-blue-600",
      change: "+3",
    },
    {
      label: "Ongoing Requests",
      value: stats.ongoingRequests.toString(),
      icon: Activity,
      color: "from-purple-500 to-purple-600",
      change: "+1",
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 overflow-y-auto min-h-screen bg-[#F9FAFB]">
      {/* ✅ Responsive Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-48 sm:h-60 md:h-72 rounded-xl overflow-hidden shadow-lg"
      >
        <img
          src={dashBanner}
          alt="Dashboard Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        <div className="relative h-full flex flex-col justify-center px-6 sm:px-12">
          <h1 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] mb-2 drop-shadow-lg">
            Welcome back, Admin Manager
          </h1>
          <p className="text-sm sm:text-lg text-white/90 font-poppins">
            Here's what's happening at HotelEase today
          </p>
        </div>
      </motion.div>

      {/* ✅ Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-5 sm:p-6 hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base font-poppins">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ✅ Charts and Updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1 xl:col-span-2"
        >
          <Card className="p-5 sm:p-6 border-none shadow-md rounded-2xl bg-white">
            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-4 sm:mb-6">
              Tasks by Department
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="tasks" radius={[8, 8, 0, 0]}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Recent Updates */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-5 sm:p-6 border-none shadow-md rounded-2xl bg-white h-full">
            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-4 sm:mb-6">
              Recent Updates
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {recentUpdates.length > 0 ? (
                recentUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          update.department === "Housekeeping"
                            ? "bg-[#6B8E23]/10 text-[#6B8E23]"
                            : update.department === "Restaurant"
                            ? "bg-[#FFD700]/20 text-[#FFA500]"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {update.department}
                      </span>
                      <span className="text-xs text-gray-500">{update.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-poppins">
                      {update.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-6">
                  No recent updates available
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ✅ Status Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-5 sm:p-6 border-none shadow-md rounded-2xl bg-white">
          <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-4 sm:mb-6">
            Real-time Department Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {departmentStatus.length > 0 ? (
              departmentStatus.map((dept) => (
                <div
                  key={dept.name}
                  className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm"
                >
                  <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#2D2D2D] mb-4">
                    {dept.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Busy</span>
                      <span className="font-semibold" style={{ color: dept.color }}>
                        {dept.busy} staff
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (dept.busy / (dept.busy + dept.available)) * 100
                          }%`,
                          backgroundColor: dept.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-green-600">
                        {dept.available} staff
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No department status data available
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
