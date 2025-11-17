import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Plus, Minus, X, Clock, Calendar, ShoppingBag } from "lucide-react";
import { FoodItem } from "./FoodCard";
import { toast } from "sonner";

interface CartItem extends FoodItem {
  quantity: number;
  notes?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onCheckout: (data: any) => void;
}

export function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onQuantityChange, 
  onRemove,
  onUpdateNotes,
  onCheckout 
}: CartDrawerProps) {
  const [deliveryTime, setDeliveryTime] = useState("asap");
  const [scheduledTime, setScheduledTime] = useState("");
  const [tip, setTip] = useState("");
  const [addCutlery, setAddCutlery] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tipAmount = tip ? parseFloat(tip) : 0;
  const taxes = subtotal * 0.05; // 5% tax
  const total = subtotal + tipAmount + taxes;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (deliveryTime === "later" && !scheduledTime) {
      toast.error("Please select a delivery time");
      return;
    }

    const orderData = {
      items,
      subtotal,
      tip: tipAmount,
      taxes,
      total,
      deliveryTime,
      scheduledTime: deliveryTime === "later" ? scheduledTime : null,
      addCutlery,
      specialInstructions,
      timestamp: new Date().toISOString(),
    };

    onCheckout(orderData);
    toast.success("Order placed successfully!");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6B8E23]" />
            Your Order ({items.length} items)
          </SheetTitle>
          <SheetDescription>
            Review your order and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">₹{item.price} each</p>
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 bg-white rounded border hover:bg-gray-100 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm px-2">{item.quantity}</span>
                        <button
                          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-[#6B8E23] text-white rounded hover:bg-[#556B2F] transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="ml-auto text-sm">₹{item.price * item.quantity}</span>
                      </div>

                      {/* Item Notes */}
                      <div className="mt-2">
                        <Input
                          placeholder="Special requests (e.g., less spicy)"
                          value={item.notes || ""}
                          onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* Delivery Time */}
              <div className="space-y-3">
                <Label>Delivery Time</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryTime("asap")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      deliveryTime === "asap"
                        ? "border-[#6B8E23] bg-[#6B8E23]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-1 text-[#6B8E23]" />
                    <p className="text-xs">ASAP (30 min)</p>
                  </button>
                  
                  <button
                    onClick={() => setDeliveryTime("later")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      deliveryTime === "later"
                        ? "border-[#6B8E23] bg-[#6B8E23]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-[#6B8E23]" />
                    <p className="text-xs">Schedule</p>
                  </button>
                </div>

                {deliveryTime === "later" && (
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Add-ons */}
              <div className="space-y-2">
                <Label>Add-ons</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addCutlery}
                    onChange={(e) => setAddCutlery(e.target.checked)}
                    className="w-4 h-4 accent-[#6B8E23]"
                  />
                  <span className="text-sm">Include cutlery and napkins</span>
                </label>
              </div>

              {/* Tip */}
              <div className="space-y-2">
                <Label htmlFor="tip">Tip for Delivery Staff (Optional)</Label>
                <Input
                  id="tip"
                  type="number"
                  placeholder="Enter amount"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  min="0"
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any additional requests..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes (5%)</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tip</span>
                    <span>₹{tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#6B8E23]">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="mt-6">
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 hover:shadow-lg"
              size="lg"
            >
              Confirm Order - ₹{total.toFixed(2)}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
