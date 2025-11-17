import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, LogOut, Plane, Car, Navigation, Compass } from "lucide-react";
import { TravelServiceCard } from "../components/travel/TravelServiceCard";
import { BookingModal } from "../components/travel/BookingModal";
import { BookingTracker } from "../components/travel/BookingTracker";
import { BookingHistory, BookingHistoryItem } from "../components/travel/BookingHistory";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { travelDeskApi } from "../services/api";
import { useAppContext } from "../context/AppContext";
import { TravelService, TravelBooking } from "../types";
import traveldeskhero from "../assets/images/traveldeskhero.png";
import airport from "../assets/images/airport.png";
import taxi from "../assets/images/taxi.png";
import outdoortravel from "../assets/images/outdoortravel.png";
import sightseeing from "../assets/images/sightseeing.png";

interface TravelDeskProps {
  roomNumber?: string;
  onBack?: () => void;
}

export default function TravelDesk({ roomNumber = "305", onBack }: TravelDeskProps) {
  const { emitEvent } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<TravelService | null>(null);
  const [currentBookingStatus, setCurrentBookingStatus] = useState<"NEW" | "CONFIRMED" | "DRIVER_ASSIGNED" | "ONGOING" | "COMPLETED" | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [currentDriverInfo, setCurrentDriverInfo] = useState<any>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>([]);
  const [services, setServices] = useState<TravelService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default services for testing (will be replaced by API call)
  const defaultServices: TravelService[] = [
    {
      id: "airport",
      title: "Airport Pickup / Drop",
      description: "Comfortable and timely airport transfers with professional drivers",
      basePrice: 1200,
      basePriceDisplay: "₹1,200",
      icon: <Plane className="w-8 h-8" />,
      image: airport,
    },
    {
      id: "taxi",
      title: "Local Taxi",
      description: "Flexible local transportation - hourly or per kilometer basis",
      basePrice: 500,
      basePriceDisplay: "₹15/km",
      icon: <Car className="w-8 h-8" />,
      image: taxi,
    },
    {
      id: "outstation",
      title: "Outstation Travel",
      description: "Long-distance travel packages with comfortable vehicles and experienced drivers",
      basePrice: 3500,
      basePriceDisplay: "₹3,500",
      icon: <Navigation className="w-8 h-8" />,
      image: outdoortravel,
    },
    {
      id: "sightseeing",
      title: "City Sightseeing Package",
      description: "Curated tours of popular attractions with knowledgeable local guides",
      basePrice: 2800,
      basePriceDisplay: "₹2,800",
      icon: <Compass className="w-8 h-8" />,
      image: sightseeing,
    },
  ];

  // Fetch available services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using Supabase API
        // const data = await travelDeskApi.getServices();
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

  // Fetch booking history on component mount
  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const response = await travelDeskApi.getBookings(roomNumber);
        const bookings = response.data || [];
        const formattedBookings: BookingHistoryItem[] = bookings.map((booking: any) => ({
          id: booking.id,
          bookingId: booking.bookingId,
          serviceType: booking.serviceType,
          pickup: booking.pickupLocation,
          drop: booking.dropLocation,
          status: booking.status === 'new' ? 'new' : booking.status === 'confirmed' ? 'confirmed' : booking.status === 'driver_assigned' ? 'driver_assigned' : booking.status === 'ongoing' ? 'ongoing' : 'completed',
          date: new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: booking.time,
          price: booking.price,
        }));
        setBookingHistory(formattedBookings);
      } catch (err) {
        console.error("Error fetching booking history:", err);
        setBookingHistory([]);
      }
    };

    fetchBookingHistory();
  }, [roomNumber]);

  const handleBookService = (service: TravelService) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      // Get or create userId
      const getUserId = () => {
        let userId = localStorage.getItem('hotelease_userId');
        if (!userId) {
          userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('hotelease_userId', userId);
        }
        return userId;
      };

      const userId = getUserId();

      // Prepare booking data for API
      const bookingPayload = {
        userId,
        roomNumber,
        serviceType: bookingData.serviceType,
        pickupLocation: bookingData.pickupLocation,
        dropLocation: bookingData.dropLocation,
        date: bookingData.date,
        time: bookingData.time,
        estimatedPrice: bookingData.estimatedPrice,
      };

      const response = await travelDeskApi.createBooking(bookingPayload);
      const createdBooking = response.data;
      
      if (!createdBooking) {
        throw new Error('Booking was not created');
      }

      const newBooking: BookingHistoryItem = {
        id: createdBooking.id,
        bookingId: createdBooking.bookingId,
        serviceType: createdBooking.serviceType,
        pickup: createdBooking.pickupLocation,
        drop: createdBooking.dropLocation,
        status: createdBooking.status === 'new' ? 'new' : createdBooking.status,
        date: new Date(createdBooking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: createdBooking.time,
        price: createdBooking.price,
      };

      setBookingHistory([newBooking, ...bookingHistory]);
      setCurrentBookingStatus("NEW");
      setCurrentBookingId(createdBooking.bookingId);

      // Emit event to notify admin dashboard
      const eventPayload = {
        bookingId: createdBooking.bookingId,
        roomNumber,
        serviceType: bookingData.serviceType,
        pickupLocation: bookingData.pickupLocation,
        dropLocation: bookingData.dropLocation,
        price: bookingData.estimatedPrice,
      };
      
      console.log("✈️ Travel Desk: Emitting booking event", eventPayload);
      emitEvent("travel_booking_created", eventPayload);

      toast.success(`Booking ${createdBooking.bookingId} confirmed successfully!`);

      // Simulate status progression (in real app, this would come from WebSocket/API updates)
      setTimeout(() => {
        setCurrentBookingStatus("CONFIRMED");
      }, 2000);
      
      setTimeout(() => {
        setCurrentBookingStatus("DRIVER_ASSIGNED");
        setCurrentDriverInfo({
          name: "Rajesh Kumar",
          phone: "+91 98765 43210",
          vehicleNumber: "DL 01 AB 1234",
        });
      }, 5000);
    } catch (err) {
      toast.error("Failed to create booking. Please try again.");
      console.error("Error creating booking:", err);
    }
  };

  const scrollToServices = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
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
      <div className="relative h-[450px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${traveldeskhero})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-[#FFD700] text-4xl sm:text-5xl lg:text-6xl mb-4">
              Your Journey Begins Here
            </h1>
            <p className="text-white/90 text-lg sm:text-xl mb-8">
              Book comfortable rides and tours directly from your room
            </p>
            <Button
              onClick={scrollToServices}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 hover:shadow-xl px-8 py-6 text-lg"
            >
              Explore Travel Options
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Booking Tracker */}
        {currentBookingStatus && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <BookingTracker
              currentStatus={currentBookingStatus}
              bookingId={currentBookingId || undefined}
              estimatedTime="15 min"
              driverInfo={currentDriverInfo}
              timestamps={{
                new: "3:45 PM",
                confirmed: currentBookingStatus !== "NEW" ? "3:47 PM" : undefined,
                driverAssigned: ["DRIVER_ASSIGNED", "ONGOING", "COMPLETED"].includes(currentBookingStatus) ? "3:50 PM" : undefined,
                ongoing: ["ONGOING", "COMPLETED"].includes(currentBookingStatus) ? "4:05 PM" : undefined,
                completed: currentBookingStatus === "COMPLETED" ? "4:35 PM" : undefined,
              }}
            />
          </motion.section>
        )}

        {/* Services Section */}
        <section id="services-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="mb-4">Our Travel Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our range of premium transportation and tour services
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading travel services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#FFD700] text-[#2D2D2D] rounded-lg hover:bg-[#FFA500]"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <TravelServiceCard
                    id={service.id}
                    title={service.title}
                    description={service.description}
                    basePrice={service.basePriceDisplay}
                    basePriceNumeric={service.basePrice}
                    icon={service.icon}
                    image={service.image}
                    onBook={() => handleBookService(service)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Booking History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BookingHistory bookings={bookingHistory} />
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#6B8E23] to-[#556B2F] text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">Need travel assistance?</p>
          <p className="text-sm text-white/80">Call Travel Desk: Ext. 300 | Concierge: Ext. 0</p>
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white/70">
              HotelEase — Your Comfort, Our Commitment.
            </p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          serviceType={selectedService.title}
          basePrice={selectedService.basePrice}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
}
