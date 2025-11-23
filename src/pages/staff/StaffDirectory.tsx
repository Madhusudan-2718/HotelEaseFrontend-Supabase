import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Phone,
  Mail,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  Clock3,
  ClipboardList,
} from "lucide-react";

import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Dialog, DialogContent } from "../../components/ui/dialog";

import staffBanner from "../../components/admin/imagess/staff.png";
import { supabase } from "../../services/api";

// ==============================
// Staff Member Type
// ==============================
interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  subRole: string;
  shiftTiming: string;
  status: string;
  rating: number;
  recentTasks: number;
}

export default function StaffDirectory() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [loading, setLoading] = useState(false);

  // Load staff using list-users edge function
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;

      const res = await fetch(
        "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/list-users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            creatorId: session?.user.id,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.error(result);
        return;
      }

      const users = result.users ?? [];

      // Filter only staff
      const staffMembers: StaffMember[] = users
        .filter((u: any) => u.role === "staff")
        .map((u: any) => {
          const meta = u.metadata || {};

          return {
            id: u.id,
            name: meta.name || "Unnamed",
            email: u.email,
            phone: meta.phone || "N/A",
            department: meta.department || "General",
            subRole: meta.subRole || "Staff",
            status: meta.status || "available",
            shiftTiming: meta.shiftTiming || "N/A",
            rating: meta.rating || 0,
            recentTasks: meta.recentTasks || 0,
          };
        });

      setStaff(staffMembers);
    } catch (error) {
      console.error("Failed to load staff", error);
    }

    setLoading(false);
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.subRole.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "high" && member.rating >= 4.5) ||
      (ratingFilter === "medium" &&
        member.rating >= 4.0 &&
        member.rating < 4.5) ||
      (ratingFilter === "low" && member.rating < 4.0);

    return matchesSearch && matchesDepartment && matchesStatus && matchesRating;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      available: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle2,
      },
      busy: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock3,
      },
      off_duty: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: XCircle,
      },
    };
    return variants[status as keyof typeof variants] || variants.available;
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Housekeeping: "bg-[#6B8E23]",
      Restaurant: "bg-[#FFD700]",
      "Travel Desk": "bg-[#FFA500]",
    };
    return colors[department] || "bg-gray-500";
  };

  const handleStaffClick = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6 bg-[#F9FAFB] min-h-screen">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-56 rounded-2xl overflow-hidden shadow-lg"
      >
        <img
          src={staffBanner}
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="relative flex flex-col justify-center h-full px-8">
          <h1 className="text-4xl font-bold text-[#FFD700] font-playfair">
            Staff Directory
          </h1>
          <p className="text-white/90 mt-2">View all hotel staff members</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-full"
        />

        <FilterSelect
          label="Department"
          value={departmentFilter}
          setValue={setDepartmentFilter}
          options={["Housekeeping", "Restaurant", "Travel Desk"]}
        />

        <FilterSelect
          label="Status"
          value={statusFilter}
          setValue={setStatusFilter}
          options={["available", "busy", "off_duty"]}
        />

        <FilterSelect
          label="Rating"
          value={ratingFilter}
          setValue={setRatingFilter}
          options={["high", "medium", "low"]}
        />
      </div>

      {/* Staff Grid */}
      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading staff...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => {
            const statusBadge = getStatusBadge(member.status);
            const StatusIcon = statusBadge.icon;

            return (
              <motion.div key={member.id} whileHover={{ scale: 1.03 }}>
                <Card
                  className="p-6 shadow-lg rounded-2xl cursor-pointer"
                  onClick={() => handleStaffClick(member)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback
                          className={`${getDepartmentColor(
                            member.department
                          )} text-white font-bold`}
                        >
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-gray-600">{member.subRole}</p>
                      </div>
                    </div>

                    <Badge className={`${statusBadge.bg} ${statusBadge.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {member.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department</span>
                      <Badge
                        className={`${getDepartmentColor(
                          member.department
                        )} text-white`}
                      >
                        {member.department}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#FFD700]" />{" "}
                        {member.rating}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks</span>
                      <span className="font-semibold text-[#6B8E23]">
                        {member.recentTasks}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {member.shiftTiming}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          {selectedStaff && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback
                    className={`${getDepartmentColor(
                      selectedStaff.department
                    )} text-white text-3xl font-bold`}
                  >
                    {selectedStaff.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-2xl font-bold">{selectedStaff.name}</h2>
                  <p className="text-gray-600">{selectedStaff.subRole}</p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={selectedStaff.phone}
                />
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={selectedStaff.email}
                />
                <InfoRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Shift"
                  value={selectedStaff.shiftTiming}
                />
                <InfoRow
                  icon={<Star className="w-4 h-4 fill-[#FFD700]" />}
                  label="Rating"
                  value={`${selectedStaff.rating}/5`}
                />
                <InfoRow
                  icon={<ClipboardList className="w-4 h-4" />}
                  label="Tasks"
                  value={selectedStaff.recentTasks.toString()}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===========================
// Reusable Components
// ===========================
function FilterSelect({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      className="px-4 py-2 rounded-xl bg-white border shadow text-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    >
      <option value="all">All {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-gray-800 text-sm">
      {icon}
      <span className="font-semibold">{label}:</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
