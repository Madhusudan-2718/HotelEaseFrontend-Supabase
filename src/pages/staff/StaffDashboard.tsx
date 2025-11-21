import React, { useEffect, useState } from "react";
import { User, ClipboardList, Briefcase, LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../services/api";
import { toast } from "sonner";

interface StaffDashboardProps {
  onLogout: () => void;
}

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const [staffEmail, setStaffEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    loadStaffInfo();
  }, []);

  // ------------------------------------------------------------
  // LOAD STAFF INFO
  // ------------------------------------------------------------
  const loadStaffInfo = async () => {
    const session = (await supabase.auth.getSession()).data.session;

    if (!session?.user) return;

    const userId = session.user.id;

    const { data } = await supabase
      .from("app_users")
      .select("email, role, status")
      .eq("id", userId)
      .single();

    if (data) {
      setStaffEmail(data.email);
      setRole(data.role);
      setStatus(data.status);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">

      {/* Top Header */}
      <div className="w-full bg-[#6B8E23] text-white py-5 px-6 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-playfair font-bold flex items-center gap-2">
          <Briefcase className="w-7 h-7" /> Staff Dashboard
        </h1>

        <Button onClick={onLogout} className="bg-red-500 text-white hover:bg-red-600">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h2>

          <p className="text-gray-700"><strong>Email:</strong> {staffEmail}</p>
          <p className="text-gray-700"><strong>Role:</strong> {role}</p>
          <p className="text-gray-700">
            <strong>Status:</strong>{" "}
            <span
              className={`font-bold ${
                status === "active" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </span>
          </p>
        </div>

        {/* Tasks Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Assigned Tasks
          </h2>

          <p className="text-gray-600 mb-3">
            Your tasks from Housekeeping, Restaurant, or Travel Desk modules
            will appear here automatically once assigned.
          </p>

          <div className="p-4 bg-gray-50 border rounded-md text-gray-500">
            No tasks assigned yet.
          </div>
        </div>

      </div>
    </div>
  );
}
