import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Car, MapPin, User, RefreshCw } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useAppContext } from "../../context/AppContext";
import travelDeskBanner from "./imagess/traveldesk.png";
import { TRAVEL_DRIVERS, TRAVEL_VEHICLES, Driver } from "../../data/staffData";

interface TravelBookingAdmin {
  id: string;
  bookingId: string;
  guestName: string;
  tripType: string;
  pickup: string;
  drop: string;
  assignedDriver: string;
  vehicle: string;
  status: "new" | "confirmed" | "driver_assigned" | "ongoing" | "completed";
  date: string;
  time: string;
  price: number;
}

export default function TravelDeskManagement() {
  const { subscribe } = useAppContext();
  const [bookings, setBookings] = useState<TravelBookingAdmin[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>(TRAVEL_DRIVERS);
  const [vehicles, setVehicles] = useState<string[]>(TRAVEL_VEHICLES);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<TravelBookingAdmin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setBookings([]);
        setDrivers(TRAVEL_DRIVERS);
        setVehicles(TRAVEL_VEHICLES);
      } catch {
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === "travel_booking_created") {
        const newBooking = {
          id: event.payload.bookingId || Date.now().toString(),
          bookingId: event.payload.bookingId,
          guestName: `Room ${event.payload.roomNumber}`,
          tripType: event.payload.serviceType,
          pickup: event.payload.pickupLocation,
          drop: event.payload.dropLocation,
          assignedDriver: "Unassigned",
          vehicle: "Not Assigned",
          status: "new" as const,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          price: event.payload.price || 0,
        };
        setBookings((prev) => {
          if (prev.some((b) => b.bookingId === newBooking.bookingId)) return prev;
          return [newBooking, ...prev];
        });
      }
    });
    return unsubscribe;
  }, [subscribe]);

  const handleAssignDriver = (booking: TravelBookingAdmin) => {
    setSelectedBooking(booking);
    setIsAssignModalOpen(true);
  };

  const handleSubmitAssignment = async (formData: any) => {
    if (selectedBooking) {
      try {
        setBookings((bookings) =>
          bookings.map((b) =>
            b.id === selectedBooking.id
              ? {
                  ...b,
                  assignedDriver: formData.driver,
                  vehicle: formData.vehicle,
                  status: formData.status,
                }
              : b
          )
        );
        toast.success(`Driver ${formData.driver} assigned successfully`);
        setIsAssignModalOpen(false);
      } catch {
        toast.error("Failed to assign driver. Please try again.");
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tripType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      driver_assigned: "bg-purple-100 text-purple-800",
      ongoing: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
    };
    return variants[status as keyof typeof variants];
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 bg-[#F9FAFB] min-h-screen overflow-y-auto">
      {/* ✅ Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 sm:h-60 md:h-72 rounded-xl overflow-hidden shadow-lg"
      >
        <img src={travelDeskBanner} alt="Travel Desk Banner" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="relative flex flex-col justify-center h-full px-6 sm:px-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] font-playfair mb-2">
            Travel Desk Dashboard
          </h1>
          <p className="text-sm sm:text-lg text-white/90 font-poppins">
            Manage guest trips, drivers, and vehicles
          </p>
        </div>
      </motion.div>

      {/* ✅ Filter Capsule */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#FFA500]/40 shadow-lg px-4 sm:px-8 py-3 sticky top-2 z-10">
          <Input
            placeholder="Search bookings, guests, or trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10 sm:h-11 rounded-full border-none bg-white/70 px-5 text-sm sm:text-base focus:ring-2 focus:ring-[#FFA500]/40"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] sm:w-[180px] h-10 sm:h-11 rounded-full bg-[#FFE580] text-[#2D2D2D] font-medium border-none shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="driver_assigned">Driver Assigned</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#2D2D2D] px-4 sm:px-6 rounded-full shadow-md hover:scale-105 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ✅ Table */}
      <Card className="border-none shadow-md rounded-2xl p-4 sm:p-6 bg-white">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading bookings...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full text-sm sm:text-base">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {["Booking ID", "Guest", "Trip Type", "Route", "Driver", "Vehicle", "Status", "Action"].map((head) => (
                    <TableHead key={head} className="font-semibold text-[#FFA500]">
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((b) => (
                  <TableRow key={b.id} className="hover:bg-gray-50">
                    <TableCell>{b.bookingId}</TableCell>
                    <TableCell>{b.guestName}</TableCell>
                    <TableCell>{b.tripType}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-600" /> {b.pickup}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-600" /> {b.drop}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" /> {b.assignedDriver}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-400" /> {b.vehicle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(b.status)}>
                        {b.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAssignDriver(b)}
                        variant="outline"
                        size="sm"
                        className="border-[#FFA500] text-[#FFA500] hover:bg-[#FFA500] hover:text-white"
                      >
                        {b.assignedDriver === "Unassigned" ? "Assign" : "Modify"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No bookings found</p>
        )}
      </Card>

      {/* ✅ Assign Driver Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl sm:text-2xl text-[#2D2D2D]">
              Assign Driver — {selectedBooking?.bookingId || "N/A"}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking ? (
            <AssignDriverForm
              booking={selectedBooking}
              drivers={drivers}
              vehicles={vehicles}
              onSubmit={handleSubmitAssignment}
              onCancel={() => setIsAssignModalOpen(false)}
            />
          ) : (
            <p className="text-center text-gray-500 py-8">No booking selected</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignDriverForm({
  booking,
  drivers,
  vehicles,
  onSubmit,
  onCancel,
}: {
  booking: TravelBookingAdmin;
  drivers: Driver[];
  vehicles: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    driver: booking.assignedDriver === "Unassigned" ? "" : booking.assignedDriver,
    vehicle: booking.vehicle === "Not Assigned" ? "" : booking.vehicle,
    status: booking.status,
    remarks: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driver || !formData.vehicle) return toast.error("Select both driver and vehicle");
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Guest</Label>
          <Input value={booking.guestName} disabled />
        </div>
        <div>
          <Label>Trip Type</Label>
          <Input value={booking.tripType} disabled />
        </div>
      </div>
      <div>
        <Label>Route</Label>
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <p>
            <MapPin className="inline w-4 h-4 text-green-600" /> {booking.pickup}
          </p>
          <p>
            <MapPin className="inline w-4 h-4 text-red-600" /> {booking.drop}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Assign Driver *</Label>
          <Select value={formData.driver} onValueChange={(v) => setFormData({ ...formData, driver: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
                <SelectItem key={d.name} value={d.name} disabled={!d.available}>
                  <div className="flex justify-between items-center">
                    {d.name}
                    <span className={`text-xs ${d.available ? "text-green-600" : "text-red-600"}`}>
                      {d.available ? "Available" : "Busy"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assign Vehicle *</Label>
          <Select value={formData.vehicle} onValueChange={(v) => setFormData({ ...formData, vehicle: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="driver_assigned">Driver Assigned</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Remarks</Label>
        <Textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          placeholder="Add any special instructions..."
          rows={3}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#2D2D2D]">
          Save Assignment
        </Button>
      </DialogFooter>
    </form>
  );
}
