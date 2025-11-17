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
} from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import staffBanner from "../admin/imagess/staff.png";
import { ALL_STAFF_MEMBERS } from "../../data/staffData";
import { StaffMember } from "../../types";

export default function StaffDirectory() {
  const [staff, setStaff] = useState<StaffMember[]>(ALL_STAFF_MEMBERS);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setStaff(ALL_STAFF_MEMBERS);
      } catch {
        setError("Failed to load staff. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [departmentFilter, statusFilter, ratingFilter, searchQuery]);

  const handleStaffClick = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsProfileModalOpen(true);
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "high" && member.rating >= 4.5) ||
      (ratingFilter === "medium" && member.rating >= 4.0 && member.rating < 4.5) ||
      (ratingFilter === "low" && member.rating < 4.0);
    return matchesSearch && matchesDepartment && matchesStatus && matchesRating;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      available: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
      busy: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock3 },
      off_duty: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle },
    };
    return variants[status as keyof typeof variants] || variants.available;
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      Housekeeping: "bg-[#6B8E23]",
      Restaurant: "bg-[#FFD700]",
      "Travel Desk": "bg-[#FFA500]",
    };
    return colors[department as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6 bg-[#F9FAFB] min-h-screen">
      {/* 🏨 Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg"
      >
        <img
          src={staffBanner}
          alt="Staff Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="relative flex flex-col justify-center h-full px-8 sm:px-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] font-playfair">
            Staff Directory
          </h1>
          <p className="text-white/90 text-sm sm:text-lg font-poppins mt-2">
            View and manage all hotel staff members efficiently
          </p>
        </div>
      </motion.div>

      {/* 🎛 Filter Capsule */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/80 backdrop-blur-xl border border-[#FFD700]/30 shadow-lg rounded-full px-4 sm:px-8 py-3">
          <Input
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10 rounded-full border-none bg-white/70 text-sm sm:text-base px-5 focus:ring-2 focus:ring-[#FFD700]/50"
          />
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            <FilterSelect label="Department" value={departmentFilter} setValue={setDepartmentFilter} options={["Housekeeping", "Restaurant", "Travel Desk"]} />
            <FilterSelect label="Status" value={statusFilter} setValue={setStatusFilter} options={["available", "busy", "off_duty"]} />
            <FilterSelect label="Rating" value={ratingFilter} setValue={setRatingFilter} options={["high", "medium", "low"]} />
          </div>
        </div>
      </motion.div>

      {/* 👥 Staff Grid */}
      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading staff...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-12">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((member) => {
              const statusBadge = getStatusBadge(member.status);
              const StatusIcon = statusBadge.icon;
              return (
                <motion.div key={member.id} whileHover={{ scale: 1.03 }}>
                  <Card
                    onClick={() => handleStaffClick(member)}
                    className="p-6 border-none shadow-lg hover:shadow-xl transition-all cursor-pointer rounded-2xl bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback
                            className={`${getDepartmentColor(member.department)} text-white text-lg font-bold`}
                          >
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#2D2D2D]">{member.name}</h3>
                          <p className="text-sm text-gray-600 font-poppins">{member.role}</p>
                        </div>
                      </div>
                      <Badge className={`${statusBadge.bg} ${statusBadge.text} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" /> {member.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department</span>
                        <Badge className={`${getDepartmentColor(member.department)} text-white`}>
                          {member.department}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                          <span className="font-semibold">{member.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recent Tasks</span>
                        <span className="font-semibold text-[#6B8E23]">{member.recentTasks}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{member.shiftTiming}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-12">No staff members found</div>
          )}
        </div>
      )}

      {/* 👤 Staff Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-xl w-[90vw] rounded-2xl">
          {selectedStaff && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback
                    className={`${getDepartmentColor(selectedStaff.department)} text-white text-3xl font-bold`}
                  >
                    {selectedStaff.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-[#2D2D2D]">{selectedStaff.name}</h3>
                  <p className="text-gray-600 font-poppins">{selectedStaff.role}</p>
                  <Badge className={`${getDepartmentColor(selectedStaff.department)} text-white`}>
                    {selectedStaff.department}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ContactInfo staff={selectedStaff} />
                <PerformanceInfo staff={selectedStaff} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 🧭 Reusable FilterSelect Component
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
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="w-[130px] sm:w-[150px] h-10 rounded-full text-sm bg-gradient-to-r from-[#FFF8DC] to-[#FFE580] text-[#2D2D2D] font-medium border-none shadow-sm">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// 🧩 Contact Info Section
function ContactInfo({ staff }: { staff: StaffMember }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-600">
        <Phone className="w-4 h-4" /> {staff.phone}
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Mail className="w-4 h-4" /> {staff.email}
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Clock className="w-4 h-4" /> {staff.shiftTiming}
      </div>
    </div>
  );
}

// ⭐ Performance Section
function PerformanceInfo({ staff }: { staff: StaffMember }) {
  const statusBadge = {
    available: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
    busy: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock3 },
    off_duty: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle },
  }[staff.status];
  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span>Rating</span>
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-[#FFD700]" /> {staff.rating}/5
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Tasks Completed</span>
        <span className="text-[#6B8E23] font-semibold">{staff.recentTasks}</span>
      </div>
      <Badge className={`${statusBadge.bg} ${statusBadge.text} flex items-center gap-1 w-fit`}>
        <StatusIcon className="w-3 h-3" /> {staff.status.replace("_", " ").toUpperCase()}
      </Badge>
    </div>
  );
}
