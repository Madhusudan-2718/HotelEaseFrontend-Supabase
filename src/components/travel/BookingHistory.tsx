import { motion } from "motion/react";
import { Badge } from "../ui/badge";
import { Clock, CheckCircle2, Navigation, XCircle, MapPin } from "lucide-react";

export type BookingHistoryStatus = "new" | "confirmed" | "driver_assigned" | "ongoing" | "completed" | "cancelled";

export interface BookingHistoryItem {
  id: string;
  bookingId: string;
  serviceType: string;
  pickup: string;
  drop: string;
  status: BookingHistoryStatus;
  date: string;
  time: string;
  price: number;
}

interface BookingHistoryProps {
  bookings: BookingHistoryItem[];
}

const statusConfig: Record<BookingHistoryStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new: {
    label: "New",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  driver_assigned: {
    label: "Driver Assigned",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  ongoing: {
    label: "Ongoing",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: <Navigation className="w-4 h-4" />,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export function BookingHistory({ bookings }: BookingHistoryProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Navigation className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500">No bookings yet</p>
        <p className="text-sm text-gray-400 mt-2">Your booking history will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="mb-6">Booking History</div>
      
      <div className="space-y-4">
        {bookings.map((booking, index) => {
          const config = statusConfig[booking.status];
          
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-900">{booking.serviceType}</span>
                    <Badge className={`${config.color} border flex items-center gap-1.5`}>
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {booking.date} at {booking.time}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Booking #{booking.bookingId}</p>
                  <p className="text-gray-900">₹{booking.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Route Info */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Pickup</p>
                      <p className="text-sm text-gray-900">{booking.pickup}</p>
                    </div>
                  </div>
                  
                  <div className="ml-3 h-6 border-l-2 border-dashed border-gray-300" />
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Drop</p>
                      <p className="text-sm text-gray-900">{booking.drop}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
