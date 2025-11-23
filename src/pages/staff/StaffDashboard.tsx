import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { User, ClipboardList, Briefcase, LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../services/api";
import { toast } from "sonner";

import staffbg from "../../assets/images/staff.png";

interface StaffDashboardProps {
  onLogout: () => void;
}

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [subRole, setSubRole] = useState("");
  const [phone, setPhone] = useState("");
  const [shiftTiming, setShiftTiming] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [recentTasks, setRecentTasks] = useState<number>(0);

  useEffect(() => {
    loadStaffInfo();
  }, []);

  const loadStaffInfo = async () => {
    const session = (await supabase.auth.getSession()).data.session;

    if (!session?.user) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const user = session.user;

    // Email
    setEmail(user.email || "");

    // Metadata fields (set by SuperAdmin)
    const meta = user.user_metadata || {};

    setName(meta.name || "");
    setDepartment(meta.department || "");
    setSubRole(meta.subRole || "");
    setPhone(meta.phone || "");
    setShiftTiming(meta.shiftTiming || "");
    setStatus(meta.status || "available");
    setRating(meta.rating || 0);
    setRecentTasks(meta.recentTasks || 0);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${staffbg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"></div>
      </div>

      <div className="relative z-20 min-h-screen">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center p-6 pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold flex items-center gap-3 text-green-400">
              <span className="p-2 rounded-lg bg-white/10 text-[#39FF14]">
                <Briefcase className="text-[#39FF14]" />
              </span>
              Staff Dashboard
            </h1>

            <p className="text-white/80 mt-1">Your profile & work overview</p>
          </div>

          <Button
            onClick={onLogout}
            className="
              bg-red-600 
              text-[#39FF14]
              px-6 py-2 rounded-xl font-semibold
              transition-all duration-300 
              hover:scale-[1.07]
              shadow-md hover:shadow-xl
              hover:bg-white hover:text-red-600
              hover:shadow-red-500/40
            "
          >
            <LogOut className="mr-2 w-5 h-5" /> Logout
          </Button>
        </header>

        {/* MAIN CONTENT */}
        <main className="px-4 sm:px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PROFILE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/20
              transition-all duration-300
              hover:scale-[1.03]
              hover:shadow-2xl hover:shadow-black/40
            "
          >
            <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2 mb-4">
              <User className="text-[#39FF14]" /> Profile
            </h2>

            <div className="text-white/90 space-y-2">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Department:</strong> {department}</p>
              <p><strong>Role:</strong> {subRole}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Shift:</strong> {shiftTiming}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-bold ${
                    status === "available"
                      ? "text-green-400"
                      : status === "busy"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {status.replace("_", " ").toUpperCase()}
                </span>
              </p>
              <p><strong>Rating:</strong> ⭐ {rating}/5</p>
              <p><strong>Recent Tasks:</strong> {recentTasks}</p>
            </div>
          </motion.div>

          {/* TASKS SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              lg:col-span-2 bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/20
              transition-all duration-300
              hover:scale-[1.03]
              hover:shadow-2xl hover:shadow-black/40
            "
          >
            <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2 mb-4">
              <ClipboardList className="text-[#39FF14]" /> Assigned Tasks
            </h2>

            <p className="text-white/70 mb-3">
              Tasks assigned to you by the hotel departments will appear here.
            </p>

            <div className="p-4 bg-white/5 border border-white/20 rounded-md text-white/60">
              No tasks assigned yet.
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
