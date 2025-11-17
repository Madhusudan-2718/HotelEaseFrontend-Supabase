import { motion } from "motion/react";
import { Badge } from "../ui/badge";
import { Sparkles, Clock, Play, CheckCircle2 } from "lucide-react";

export type HistoryStatus = "new" | "in_progress" | "completed" | "scheduled";

export interface RequestHistoryItem {
  id: string;
  serviceType: string;
  status: HistoryStatus;
  date: string;
  time: string;
  notes?: string;
}

interface RequestHistoryProps {
  requests: RequestHistoryItem[];
}

const statusConfig: Record<HistoryStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new: {
    label: "New",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <Sparkles className="w-4 h-4" />,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: <Play className="w-4 h-4" />,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  scheduled: {
    label: "Scheduled",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: <Clock className="w-4 h-4" />,
  },
};

export function RequestHistory({ requests }: RequestHistoryProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500">No housekeeping requests yet</p>
        <p className="text-sm text-gray-400 mt-2">Your request history will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="mb-6">Request History</div>
      
      <div className="space-y-4">
        {requests.map((request, index) => {
          const config = statusConfig[request.status];
          
          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-900">{request.serviceType}</span>
                    <Badge className={`${config.color} border flex items-center gap-1.5`}>
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {request.date} at {request.time}
                    </span>
                  </div>
                  
                  {request.notes && (
                    <p className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                      {request.notes}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
