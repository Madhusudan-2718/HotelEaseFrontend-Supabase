import { motion } from "motion/react";
import { Badge } from "../ui/badge";
import { Clock, CheckCircle2, Truck, ShoppingBag } from "lucide-react";

export type OrderHistoryStatus = "new" | "preparing" | "out_for_delivery" | "delivered";

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  status: OrderHistoryStatus;
  date: string;
  time: string;
}

interface OrderHistoryProps {
  orders: OrderHistoryItem[];
}

const statusConfig: Record<OrderHistoryStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new: {
    label: "New",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <Clock className="w-4 h-4" />,
  },
  preparing: {
    label: "Preparing",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: <Clock className="w-4 h-4" />,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
};

export function OrderHistory({ orders }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500">No orders yet</p>
        <p className="text-sm text-gray-400 mt-2">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="mb-6">Order History</div>
      
      <div className="space-y-4">
        {orders.map((order, index) => {
          const config = statusConfig[order.status];
          
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-900">Order #{order.orderNumber}</span>
                    <Badge className={`${config.color} border flex items-center gap-1.5`}>
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {order.date} at {order.time}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-gray-900">₹{order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Items:</p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      {item.quantity}x {item.name}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
