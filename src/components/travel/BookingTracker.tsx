import { motion } from "motion/react";
import { Check, Clock, UserCheck, Navigation, CheckCircle2, Phone, Car } from "lucide-react";

type BookingStatus = "NEW" | "CONFIRMED" | "DRIVER_ASSIGNED" | "ONGOING" | "COMPLETED";

interface BookingTrackerProps {
  currentStatus: BookingStatus;
  bookingId?: string;
  estimatedTime?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  timestamps?: {
    new?: string;
    confirmed?: string;
    driverAssigned?: string;
    ongoing?: string;
    completed?: string;
  };
}

const statusSteps: { status: BookingStatus; label: string; icon: React.ReactNode }[] = [
  { status: "NEW", label: "Booking Placed", icon: <Clock className="w-5 h-5" /> },
  { status: "CONFIRMED", label: "Confirmed", icon: <Check className="w-5 h-5" /> },
  { status: "DRIVER_ASSIGNED", label: "Driver Assigned", icon: <UserCheck className="w-5 h-5" /> },
  { status: "ONGOING", label: "Ongoing", icon: <Navigation className="w-5 h-5" /> },
  { status: "COMPLETED", label: "Completed", icon: <CheckCircle2 className="w-5 h-5" /> },
];

export function BookingTracker({ 
  currentStatus, 
  bookingId,
  estimatedTime,
  driverInfo,
  timestamps = {} 
}: BookingTrackerProps) {
  const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3>Track Your Ride</h3>
          {bookingId && (
            <span className="text-sm text-gray-500">Booking #{bookingId}</span>
          )}
        </div>
        {estimatedTime && currentStatus !== "COMPLETED" && (
          <p className="text-sm text-gray-600">
            Estimated arrival: <span className="text-[#6B8E23]">{estimatedTime}</span>
          </p>
        )}
      </div>

      {/* Driver Info Card */}
      {driverInfo && ["DRIVER_ASSIGNED", "ONGOING"].includes(currentStatus) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 bg-gradient-to-r from-[#6B8E23]/10 to-[#FFD700]/10 rounded-xl border border-[#6B8E23]/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#6B8E23] rounded-full flex items-center justify-center text-white">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Your Driver</p>
              <p className="text-gray-900 mb-1">{driverInfo.name}</p>
              <p className="text-sm text-gray-600 mb-2">{driverInfo.vehicleNumber}</p>
              <a
                href={`tel:${driverInfo.phone}`}
                className="inline-flex items-center gap-2 text-sm text-[#6B8E23] hover:underline"
              >
                <Phone className="w-4 h-4" />
                {driverInfo.phone}
              </a>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#6B8E23] to-[#FFD700]"
          />
        </div>

        {/* Status Steps */}
        <div className="grid grid-cols-5 gap-2">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const timestamp = timestamps[step.status.toLowerCase() as keyof typeof timestamps];

            return (
              <div key={step.status} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                    isCompleted
                      ? "bg-gradient-to-br from-[#6B8E23] to-[#FFD700] text-white shadow-lg"
                      : "bg-gray-200 text-gray-400"
                  } ${isCurrent ? "ring-4 ring-[#FFD700]/30 scale-110" : ""}`}
                >
                  {isCompleted && index < currentIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </motion.div>
                
                <p className={`text-center text-xs mb-1 ${
                  isCompleted ? "text-gray-900" : "text-gray-400"
                }`}>
                  {step.label}
                </p>
                
                {timestamp && (
                  <p className="text-xs text-gray-500">{timestamp}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Message */}
      <motion.div
        key={currentStatus}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-4 bg-gradient-to-r from-[#6B8E23]/10 to-[#FFD700]/10 rounded-lg"
      >
        <p className="text-sm text-center text-gray-700">
          {currentStatus === "NEW" && "Your booking has been received and is being processed."}
          {currentStatus === "CONFIRMED" && "Your booking is confirmed! We're assigning a driver now."}
          {currentStatus === "DRIVER_ASSIGNED" && "A driver has been assigned and will arrive shortly."}
          {currentStatus === "ONGOING" && "Your journey is in progress. Have a pleasant ride!"}
          {currentStatus === "COMPLETED" && "Journey completed! Thank you for choosing HotelEase."}
        </p>
      </motion.div>
    </div>
  );
}
