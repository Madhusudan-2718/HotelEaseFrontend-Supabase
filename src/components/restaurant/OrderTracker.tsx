import { motion } from "motion/react";
import { Check, Clock, ChefHat, Truck, CheckCircle2 } from "lucide-react";

type OrderStatus = "NEW" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

interface OrderTrackerProps {
  currentStatus: OrderStatus;
  estimatedTime?: string;
  orderNumber?: string;
  timestamps?: {
    new?: string;
    preparing?: string;
    outForDelivery?: string;
    delivered?: string;
  };
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "NEW", label: "Order Placed", icon: <Clock className="w-5 h-5" /> },
  { status: "PREPARING", label: "Preparing", icon: <ChefHat className="w-5 h-5" /> },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: <Truck className="w-5 h-5" /> },
  { status: "DELIVERED", label: "Delivered", icon: <CheckCircle2 className="w-5 h-5" /> },
];

export function OrderTracker({ 
  currentStatus, 
  estimatedTime = "30 min",
  orderNumber,
  timestamps = {} 
}: OrderTrackerProps) {
  const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3>Track Your Order</h3>
          {orderNumber && (
            <span className="text-sm text-gray-500">Order #{orderNumber}</span>
          )}
        </div>
        {currentStatus !== "DELIVERED" && (
          <p className="text-sm text-gray-600">
            Estimated delivery: <span className="text-[#6B8E23]">{estimatedTime}</span>
          </p>
        )}
      </div>
      
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
        <div className="grid grid-cols-4 gap-4">
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
                
                <p className={`text-center text-xs sm:text-sm mb-1 ${
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
          {currentStatus === "NEW" && "Your order has been received and will be prepared shortly."}
          {currentStatus === "PREPARING" && "Our chefs are preparing your delicious meal with care."}
          {currentStatus === "OUT_FOR_DELIVERY" && "Your order is on its way to your room!"}
          {currentStatus === "DELIVERED" && "Enjoy your meal! We hope you love it."}
        </p>
      </motion.div>
    </div>
  );
}
