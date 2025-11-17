import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MapPin, Calendar, Clock, Users, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
  basePrice: number;
  onSubmit: (data: any) => void;
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  serviceType, 
  basePrice,
  onSubmit 
}: BookingModalProps) {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [notes, setNotes] = useState("");

  const calculatePrice = () => {
    const passengersCount = parseInt(passengers) || 1;
    const multiplier = passengersCount > 2 ? 1.2 : 1;
    return (basePrice * multiplier).toFixed(2);
  };

  const handleSubmit = () => {
    if (!pickupLocation || !date || !time) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (serviceType !== "City Sightseeing Package" && !dropLocation) {
      toast.error("Please provide drop location");
      return;
    }

    const bookingData = {
      serviceType,
      pickupLocation,
      dropLocation: dropLocation || "As per package",
      date,
      time,
      passengers: parseInt(passengers),
      notes,
      estimatedPrice: parseFloat(calculatePrice()),
      timestamp: new Date().toISOString(),
    };

    onSubmit(bookingData);
    toast.success("Booking confirmed successfully!");
    
    // Reset form
    setPickupLocation("");
    setDropLocation("");
    setDate("");
    setTime("");
    setPassengers("1");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book {serviceType}</DialogTitle>
          <DialogDescription>
            Please provide your travel details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service-type">Service Type</Label>
            <Select value={serviceType} disabled>
              <SelectTrigger id="service-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={serviceType}>{serviceType}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pickup Location */}
          <div className="space-y-2">
            <Label htmlFor="pickup" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6B8E23]" />
              Pickup Location *
            </Label>
            <Input
              id="pickup"
              placeholder={serviceType.includes("Airport") ? "Hotel lobby" : "Enter pickup address"}
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>

          {/* Drop Location */}
          {serviceType !== "City Sightseeing Package" && (
            <div className="space-y-2">
              <Label htmlFor="drop" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6B8E23]" />
                Drop Location *
              </Label>
              <Input
                id="drop"
                placeholder={serviceType.includes("Airport") ? "Airport terminal" : "Enter drop address"}
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
              />
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6B8E23]" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6B8E23]" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Number of Passengers */}
          <div className="space-y-2">
            <Label htmlFor="passengers" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6B8E23]" />
              Number of Passengers *
            </Label>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger id="passengers">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Passenger</SelectItem>
                <SelectItem value="2">2 Passengers</SelectItem>
                <SelectItem value="3">3 Passengers</SelectItem>
                <SelectItem value="4">4 Passengers</SelectItem>
                <SelectItem value="5">5+ Passengers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Special Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Need child seat, Extra luggage space, Preferred route"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Price Estimate */}
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimated Price</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#6B8E23]" />
                  <span className="text-2xl text-gray-900">{calculatePrice()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Base: ₹{basePrice}</p>
                {parseInt(passengers) > 2 && (
                  <p className="text-xs text-[#6B8E23]">+20% for 3+ passengers</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Final price may vary based on actual distance and time
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 hover:shadow-lg"
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
