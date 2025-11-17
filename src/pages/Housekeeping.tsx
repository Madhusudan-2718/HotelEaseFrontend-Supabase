import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, Bed, Moon, Package, LogOut } from "lucide-react";
import { ServiceCard } from "../components/housekeeping/ServiceCard";
import { RequestModal } from "../components/housekeeping/RequestModal";
import { StatusTracker } from "../components/housekeeping/StatusTracker";
import { RequestHistory, RequestHistoryItem } from "../components/housekeeping/RequestHistory";
import { toast } from "sonner";
import { housekeepingApi } from "../services/api";
import { useAppContext } from "../context/AppContext";
import { HousekeepingService, HousekeepingRequest } from "../types";
import hkeep from "@/assets/images/hkeep.png";
import linen from "@/assets/images/linen.png";
import turndown from "@/assets/images/turndown.png";
import extraamenities from "@/assets/images/extraamenities.png";
import hotelroom from "@/assets/images/hotelroom.png";


interface HousekeepingProps {
  roomNumber?: string;
  onBack?: () => void;
}

export default function Housekeeping({ roomNumber = "305", onBack }: HousekeepingProps) {
  const { emitEvent } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [currentRequestStatus, setCurrentRequestStatus] = useState<"NEW" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | null>(null);
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [services, setServices] = useState<HousekeepingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default services for testing (will be replaced by API call)
  const defaultServices: HousekeepingService[] = [
    {
      id: "1",
      title: "Room Cleaning",
      description: "Complete room cleaning including floors, surfaces, and bathroom",
      icon: <Sparkles className="w-6 h-6 text-[#6B8E23]" />,
      image: hkeep,
    },
    {
      id: "2",
      title: "Linen/Towel Replacement",
      description: "Fresh bed linens, towels, and bathroom amenities",
      icon: <Bed className="w-6 h-6 text-[#6B8E23]" />,
      image: linen,
    },
    {
      id: "3",
      title: "Turn-Down Service",
      description: "Evening room preparation with bed turn-down and nighttime amenities",
      icon: <Moon className="w-6 h-6 text-[#6B8E23]" />,
      image: turndown,
    },
    {
      id: "4",
      title: "Extra Amenities",
      description: "Additional water bottles, toiletries, towels, or other room supplies",
      icon: <Package className="w-6 h-6 text-[#6B8E23]" />,
      image: 
      extraamenities,
    },
  ];

  // Fetch available services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using Supabase API
        // const data = await housekeepingApi.getServices();
        // setServices(data);
        
        // For testing: Use default services (will be replaced by API)
        setServices(defaultServices);
      } catch (err) {
        setError("Failed to load services. Please try again later.");
        console.error("Error fetching services:", err);
        // Fallback to default services on error
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get or create userId
  const getUserId = () => {
    let userId = localStorage.getItem('hotelease_userId');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('hotelease_userId', userId);
    }
    return userId;
  };

  // Fetch request history on component mount
  useEffect(() => {
    const fetchRequestHistory = async () => {
      try {
        const response = await housekeepingApi.getRequests(roomNumber);
        const requests = response.data || [];
        const formattedRequests: RequestHistoryItem[] = requests.map((req: any) => ({
          id: req.id,
          serviceType: req.requestType,
          status: req.status === 'pending' ? 'new' : req.status === 'assigned' ? 'assigned' : req.status === 'in_progress' ? 'in_progress' : 'completed',
          date: new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date(req.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          notes: req.notes,
        }));
        setRequestHistory(formattedRequests);
      } catch (err) {
        console.error("Error fetching request history:", err);
        setRequestHistory([]);
      }
    };

    fetchRequestHistory();
  }, [roomNumber]);

  const handleServiceRequest = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    setIsModalOpen(true);
  };

  const handleRequestSubmit = async (data: any) => {
    try {
      const userId = getUserId();
      
      // Prepare request data for API
      const requestPayload = {
        userId,
        roomNumber,
        serviceType: data.serviceType,
        notes: data.notes,
        scheduledTime: data.schedule === "later" ? data.scheduledTime : undefined,
        priority: data.priority || "medium",
      };

      const response = await housekeepingApi.createRequest(requestPayload);
      const createdRequest = response.data;
      
      if (!createdRequest) {
        throw new Error('Request was not created');
      }

      const newRequest: RequestHistoryItem = {
        id: createdRequest.id,
        serviceType: createdRequest.requestType,
        status: createdRequest.status === 'pending' ? 'new' : createdRequest.status === 'assigned' ? 'assigned' : createdRequest.status === 'in_progress' ? 'in_progress' : 'completed',
        date: new Date(createdRequest.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: createdRequest.scheduledTime ? new Date(createdRequest.scheduledTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : new Date(createdRequest.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        notes: createdRequest.notes,
      };

      setRequestHistory([newRequest, ...requestHistory]);
      setCurrentRequestStatus("NEW");

      // Emit event to notify admin dashboard
      const eventPayload = {
        requestId: createdRequest.id,
        roomNumber,
        serviceType: data.serviceType,
        priority: requestPayload.priority,
        notes: data.notes,
      };
      
      console.log("🧹 Housekeeping: Emitting request event", eventPayload);
      emitEvent("housekeeping_request_created", eventPayload);

      toast.success("Service request submitted successfully!");

      // Refresh request history to get latest status
      setTimeout(async () => {
        try {
          const response = await housekeepingApi.getRequests(roomNumber);
          const requests = response.data || [];
          const formattedRequests: RequestHistoryItem[] = requests.map((req: any) => ({
            id: req.id,
            serviceType: req.requestType,
            status: req.status === 'pending' ? 'new' : req.status === 'assigned' ? 'assigned' : req.status === 'in_progress' ? 'in_progress' : 'completed',
            date: new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            time: new Date(req.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            notes: req.notes,
          }));
          setRequestHistory(formattedRequests);
          
          // Update current request status if it matches
          const currentRequest = requests.find((r: any) => r.id === createdRequest.id);
          if (currentRequest) {
            const statusMap: Record<string, string> = {
              'pending': 'NEW',
              'assigned': 'ASSIGNED',
              'in_progress': 'IN_PROGRESS',
              'completed': 'COMPLETED',
            };
            setCurrentRequestStatus(statusMap[currentRequest.status] as any || 'NEW');
          }
        } catch (err) {
          console.error("Error refreshing request status:", err);
        }
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request. Please try again.");
      console.error("Error submitting request:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <div>
                <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                  HotelEase
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Your Room</p>
                <p className="text-[#6B8E23]">Room {roomNumber}</p>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Exit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${hotelroom})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[#FFD700] text-4xl sm:text-5xl lg:text-6xl mb-4">
              How may we assist you today?
            </h1>
            <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto">
              Choose a housekeeping service or schedule one at your convenience
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Service Cards */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="mb-4">Our Housekeeping Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select from our range of professional services designed for your comfort
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#6B8E23] text-white rounded-lg hover:bg-[#556B2F]"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    image={service.image}
                    onRequest={() => handleServiceRequest(service.title)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Status Tracker */}
        {currentRequestStatus && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <StatusTracker
              currentStatus={currentRequestStatus}
              timestamps={{
                new: "2:30 PM",
                assigned: currentRequestStatus !== "NEW" ? "2:32 PM" : undefined,
                inProgress: ["IN_PROGRESS", "COMPLETED"].includes(currentRequestStatus) ? "2:45 PM" : undefined,
                completed: currentRequestStatus === "COMPLETED" ? "3:15 PM" : undefined,
              }}
            />
          </motion.section>
        )}

        {/* Request History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <RequestHistory requests={requestHistory} />
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#6B8E23] to-[#556B2F] text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">Need immediate assistance?</p>
          <p className="text-sm text-white/80">Call Front Desk: Ext. 0 | Emergency: Ext. 911</p>
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white/70">
              HotelEase © 2025. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType={selectedService}
        onSubmit={handleRequestSubmit}
      />
    </div>
  );
}
