import { motion } from "motion/react";
import { Check, Clock, Play, Sparkles } from "lucide-react";

type RequestStatus = "NEW" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";

interface StatusTrackerProps {
  currentStatus: RequestStatus;
  timestamps?: {
    new?: string;
    assigned?: string;
    inProgress?: string;
    completed?: string;
  };
}

const statusSteps: { status: RequestStatus; label: string; icon: React.ReactNode }[] = [
  { status: "NEW", label: "New Request", icon: <Sparkles className="w-5 h-5" /> },
  { status: "ASSIGNED", label: "Assigned", icon: <Clock className="w-5 h-5" /> },
  { status: "IN_PROGRESS", label: "In Progress", icon: <Play className="w-5 h-5" /> },
  { status: "COMPLETED", label: "Completed", icon: <Check className="w-5 h-5" /> },
];

export function StatusTracker({ currentStatus, timestamps = {} }: StatusTrackerProps) {
  const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="mb-8">Request Status</div>
      
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
                  {step.icon}
                </motion.div>
                
                <p className={`text-center text-sm mb-1 ${
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
    </div>
  );
}
