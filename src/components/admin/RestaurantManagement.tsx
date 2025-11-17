import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, ChefHat, Truck, RefreshCw } from "lucide-react";
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
import { toast } from "sonner";
import { useAppContext } from "../../context/AppContext";
import restaurantBanner from "../admin/imagess/res.png";
import { RESTAURANT_CHEFS, RESTAURANT_WAITERS } from "../../data/staffData";

interface RestaurantOrder {
  id: string;
  orderNumber: string;
  roomNumber: string;
  dishes: string[];
  assignedChef: string;
  assignedWaiter: string;
  status: "new" | "preparing" | "out_for_delivery" | "delivered";
  estimatedDelivery: string;
  total: number;
}

export default function RestaurantManagement() {
  const { subscribe } = useAppContext();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [chefs, setChefs] = useState<string[]>(RESTAURANT_CHEFS);
  const [waiters, setWaiters] = useState<string[]>(RESTAURANT_WAITERS);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setOrders([]);
        setChefs(RESTAURANT_CHEFS);
        setWaiters(RESTAURANT_WAITERS);
      } catch {
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, searchQuery]);

  // Subscribe for live orders
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === "restaurant_order_created") {
        const newOrder = {
          id: event.payload.orderId,
          orderNumber: event.payload.orderNumber,
          roomNumber: event.payload.roomNumber,
          dishes:
            event.payload.items?.map((item: any) => item.name) || ["Unknown"],
          assignedChef: "Unassigned",
          assignedWaiter: "Unassigned",
          status: "new" as const,
          estimatedDelivery: "30 min",
          total: event.payload.total || 0,
        };
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
      }
    });
    return unsubscribe;
  }, [subscribe]);

  const handleAssignStaff = (order: RestaurantOrder) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const handleSubmitAssignment = async (formData: any) => {
    if (selectedOrder) {
      try {
        setOrders((orders) =>
          orders.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  assignedChef: formData.chef,
                  assignedWaiter: formData.waiter,
                  status: formData.status,
                }
              : o
          )
        );
        toast.success("Staff assigned successfully");
        setIsAssignModalOpen(false);
        setSelectedOrder(null);
      } catch {
        toast.error("Failed to assign staff. Please try again.");
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
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
        <img
          src={restaurantBanner}
          alt="Restaurant Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="relative flex flex-col justify-center h-full px-6 sm:px-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] font-playfair mb-2">
            Restaurant Management
          </h1>
          <p className="text-sm sm:text-lg text-white/90 font-poppins">
            Manage dining orders, chefs, and waiters efficiently
          </p>
        </div>
      </motion.div>

      {/* ✅ Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-2 z-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#FFD700]/40 shadow-lg px-4 sm:px-8 py-3">
          <Input
            placeholder="Search by order or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10 sm:h-11 rounded-full border-none bg-white/70 px-5 text-sm sm:text-base placeholder:text-gray-500 focus:ring-2 focus:ring-[#FFD700]/40 transition-all"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] sm:w-[180px] h-10 sm:h-11 rounded-full bg-[#FFF5CC] text-[#2D2D2D] border-none font-medium shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#2D2D2D] px-4 sm:px-6 rounded-full shadow-md hover:scale-105 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ✅ Orders Table */}
      <Card className="border-none shadow-md rounded-2xl p-4 sm:p-6 bg-white">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading orders...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full text-sm sm:text-base">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Order #</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Dishes</TableHead>
                  <TableHead>Chef</TableHead>
                  <TableHead>Waiter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>#{order.orderNumber}</TableCell>
                    <TableCell>{order.roomNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {order.dishes.map((dish, idx) => (
                          <span key={idx} className="text-xs sm:text-sm">
                            {dish}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-gray-400" />
                        {order.assignedChef}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {order.assignedWaiter}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.status)}>
                        {order.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAssignStaff(order)}
                        variant="outline"
                        size="sm"
                        className="border-[#FFD700] text-[#FFA500] hover:bg-[#FFD700] hover:text-[#2D2D2D]"
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No orders found</p>
        )}
      </Card>

      {/* ✅ Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl sm:text-2xl">
              Assign Staff — Order #{selectedOrder?.orderNumber || "N/A"}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <AssignStaffForm
              order={selectedOrder}
              chefs={chefs}
              waiters={waiters}
              onSubmit={handleSubmitAssignment}
              onCancel={() => {
                setIsAssignModalOpen(false);
                setSelectedOrder(null);
              }}
            />
          ) : (
            <p className="text-center text-gray-500 py-8">No order selected</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignStaffForm({
  order,
  chefs,
  waiters,
  onSubmit,
  onCancel,
}: {
  order: RestaurantOrder;
  chefs: string[];
  waiters: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    chef: order.assignedChef === "Unassigned" ? "" : order.assignedChef,
    waiter: order.assignedWaiter === "Unassigned" ? "" : order.assignedWaiter,
    status: order.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.chef || !formData.waiter)
      return toast.error("Select both chef and waiter");
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div>
        <Label>Room Number</Label>
        <Input value={order.roomNumber} disabled />
      </div>
      <div>
        <Label>Dishes</Label>
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          {order.dishes.join(", ")}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Assign Chef *</Label>
          <Select
            value={formData.chef}
            onValueChange={(v) => setFormData({ ...formData, chef: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Chef" />
            </SelectTrigger>
            <SelectContent>
              {chefs.map((chef) => (
                <SelectItem key={chef} value={chef}>
                  {chef}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assign Waiter *</Label>
          <Select
            value={formData.waiter}
            onValueChange={(v) => setFormData({ ...formData, waiter: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Waiter" />
            </SelectTrigger>
            <SelectContent>
              {waiters.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(v) => setFormData({ ...formData, status: v as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#2D2D2D]"
        >
          Save Assignment
        </Button>
      </DialogFooter>
    </form>
  );
}
