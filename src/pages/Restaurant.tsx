import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ShoppingCart, Filter, LogOut } from "lucide-react";
import { FoodCard, FoodItem } from "../components/restaurant/FoodCard";
import { CartDrawer } from "../components/restaurant/CartDrawer";
import { OrderTracker } from "../components/restaurant/OrderTracker";
import { OrderHistory, OrderHistoryItem } from "../components/restaurant/OrderHistory";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { restaurantApi } from "../services/api";
import { useAppContext } from "../context/AppContext";
import { FoodItem as FoodItemType, Order } from "../types";
import food from "../assets/images/food.png";
import chicken from "../assets/images/Butter Chicken.png";
import pasta from "../assets/images/Pasta Alfredo.png";
import paneer from "../assets/images/Paneer Tikka Masala.png";
import salad from "../assets/images/Grilled Chicken Salad.png";
import cake from "../assets/images/Chocolate Lava Cake.png";
import cappuccino from "../assets/images/Cappuccino.png";
import biryani from "../assets/images/Biryani.png";
import caesarSalad from "../assets/images/Caesar Salad.png";

interface RestaurantProps {
  roomNumber?: string;
  onBack?: () => void;
}

type CartItem = FoodItem & { quantity: number; notes?: string };

export default function Restaurant({ roomNumber = "305", onBack }: RestaurantProps) {
  const { emitEvent } = useAppContext();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [dietFilter, setDietFilter] = useState("all");
  const [currentOrderStatus, setCurrentOrderStatus] = useState<"NEW" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | null>(null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItemType[]>([]);
  const [loading, setLoading] = useState(false); // Start as false since we use default data for testing
  const [error, setError] = useState<string | null>(null);

  // Default menu items for testing (will be replaced by API call)
  const defaultMenuItems: FoodItemType[] = [
    {
      id: "1",
      name: "Butter Chicken",
      description: "Tender chicken in rich, creamy tomato gravy with aromatic spices",
      price: 450,
      image: chicken,
      category: "Main Course",
      isVeg: false,
      cuisine: "Indian",
    },
    {
      id: "2",
      name: "Pasta Alfredo",
      description: "Creamy fettuccine pasta with parmesan and garlic butter sauce",
      price: 380,
      image: pasta,
      category: "Main Course",
      isVeg: true,
      cuisine: "Continental",
    },
    {
      id: "3",
      name: "Paneer Tikka Masala",
      description: "Grilled cottage cheese cubes in spiced tomato curry",
      price: 320,
      image: paneer,
      category: "Main Course",
      isVeg: true,
      cuisine: "Indian",
    },
    {
      id: "4",
      name: "Grilled Chicken Salad",
      description: "Fresh greens with grilled chicken, cherry tomatoes, and balsamic dressing",
      price: 280,
      image: salad,
      category: "Appetizers",
      isVeg: false,
      cuisine: "Continental",
    },
    {
      id: "5",
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten center, served with vanilla ice cream",
      price: 180,
      image: cake,
      category: "Desserts",
      isVeg: true,
      cuisine: "Continental",
    },
    {
      id: "6",
      name: "Cappuccino",
      description: "Rich espresso with steamed milk and foam, dusted with cocoa",
      price: 120,
      image: cappuccino,
      category: "Beverages",
      isVeg: true,
      cuisine: "Continental",
    },
    {
      id: "7",
      name: "Biryani",
      description: "Fragrant basmati rice with spiced chicken and aromatic herbs",
      price: 420,
      image: biryani,
      category: "Main Course",
      isVeg: false,
      cuisine: "Indian",
    },
    {
      id: "8",
      name: "Caesar Salad",
      description: "Crisp romaine with parmesan, croutons, and Caesar dressing",
      price: 220,
      image: caesarSalad,
      category: "Appetizers",
      isVeg: true,
      cuisine: "Continental",
    },
  ];

  // Fetch menu items on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setError(null);
        // Using Supabase API
        // setLoading(true);
        // const data = await restaurantApi.getMenuItems();
        // setMenuItems(data);
        // setLoading(false);
        
        // For testing: Use default menu items immediately (will be replaced by API)
        setMenuItems(defaultMenuItems);
      } catch (err) {
        setError("Failed to load menu items. Please try again later.");
        console.error("Error fetching menu items:", err);
        // Fallback to default items on error
        setMenuItems(defaultMenuItems);
      }
    };

    fetchMenuItems();
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

  // Fetch order history on component mount
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await restaurantApi.getOrders(roomNumber);
        const orders = response.data || [];
        const formattedOrders: OrderHistoryItem[] = orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          items: [{ name: order.itemName, quantity: order.quantity }],
          total: order.totalPrice,
          status: order.status === 'pending' ? 'new' : order.status === 'preparing' ? 'preparing' : order.status === 'out_for_delivery' ? 'out_for_delivery' : 'delivered',
          date: new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        }));
        setOrderHistory(formattedOrders);
      } catch (err) {
        console.error("Error fetching order history:", err);
        setOrderHistory([]);
      }
    };

    fetchOrderHistory();
  }, [roomNumber]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (cuisineFilter !== "all" && item.cuisine !== cuisineFilter) return false;
      if (dietFilter === "veg" && !item.isVeg) return false;
      if (dietFilter === "non-veg" && item.isVeg) return false;
      return true;
    });
  }, [menuItems, categoryFilter, cuisineFilter, dietFilter]);

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item: FoodItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { ...item, quantity: 1 },
    }));
    toast.success(`${item.name} added to cart`);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity },
    }));
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes },
    }));
  };

  const handleCheckout = async (orderData: any) => {
    try {
      const userId = getUserId();
      
      // Prepare order data for API
      const orderPayload = {
        userId,
        roomNumber,
        items: orderData.items.map((item: CartItem) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        total: orderData.total,
        notes: orderData.items.map((item: CartItem) => item.notes).filter(Boolean).join(', ') || undefined,
      };

      const response = await restaurantApi.createOrder(orderPayload);
      const createdOrders = response.data || [];
      
      if (createdOrders.length === 0) {
        throw new Error('No orders were created');
      }

      // Use the first order for tracking
      const firstOrder = createdOrders[0];
      const orderNumber = firstOrder.orderNumber;

      // Update order history
      const newOrders: OrderHistoryItem[] = createdOrders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        items: [{ name: order.itemName, quantity: order.quantity }],
        total: order.totalPrice,
        status: "new",
        date: new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      }));

      setOrderHistory([...newOrders, ...orderHistory]);
      setCurrentOrderStatus("NEW");
      setCurrentOrderNumber(orderNumber);
      setCart({});

      // Emit event to notify admin dashboard
      const eventPayload = {
        orderId: firstOrder.id,
        orderNumber: firstOrder.orderNumber,
        roomNumber,
        total: firstOrder.totalPrice,
        items: [{ name: firstOrder.itemName, quantity: firstOrder.quantity }],
      };
      
      console.log("🍽️ Restaurant: Emitting order event", eventPayload);
      emitEvent("restaurant_order_created", eventPayload);

      toast.success(`Order #${orderNumber} placed successfully!`);

      // Refresh order history to get latest status
      setTimeout(async () => {
        try {
          const response = await restaurantApi.getOrders(roomNumber);
          const orders = response.data || [];
          const formattedOrders: OrderHistoryItem[] = orders.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            items: [{ name: order.itemName, quantity: order.quantity }],
            total: order.totalPrice,
            status: order.status === 'pending' ? 'new' : order.status === 'preparing' ? 'preparing' : order.status === 'out_for_delivery' ? 'out_for_delivery' : 'delivered',
            date: new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            time: new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          }));
          setOrderHistory(formattedOrders);
          
          // Update current order status if it matches
          const currentOrder = orders.find((o: any) => o.orderNumber === orderNumber);
          if (currentOrder) {
            const statusMap: Record<string, string> = {
              'pending': 'NEW',
              'preparing': 'PREPARING',
              'out_for_delivery': 'OUT_FOR_DELIVERY',
              'delivered': 'DELIVERED',
            };
            setCurrentOrderStatus(statusMap[currentOrder.status] as any || 'NEW');
          }
        } catch (err) {
          console.error("Error refreshing order status:", err);
        }
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
      console.error("Error placing order:", err);
    }
  };

  const scrollToMenu = () => {
    document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
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
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Your Room</p>
                <p className="text-[#6B8E23]">Room {roomNumber}</p>
              </div>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FFD700] text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {onBack && (
                <button
                  onClick={onBack}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Exit
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
            backgroundImage: `url(${food})`,
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
              Savor the Luxury of Dining In
            </h1>
            <p className="text-white/90 text-lg sm:text-xl mb-8">
              Order delicious meals right from your room — freshly prepared and delivered
            </p>
            <Button
              onClick={scrollToMenu}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 hover:shadow-xl px-8 py-6 text-lg"
            >
              View Menu
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Order Tracker */}
        {currentOrderStatus && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <OrderTracker
              currentStatus={currentOrderStatus}
              orderNumber={currentOrderNumber || undefined}
              estimatedTime="30 min"
              timestamps={{
                new: "7:45 PM",
                preparing: currentOrderStatus !== "NEW" ? "7:48 PM" : undefined,
                outForDelivery: ["OUT_FOR_DELIVERY", "DELIVERED"].includes(currentOrderStatus) ? "8:05 PM" : undefined,
                delivered: currentOrderStatus === "DELIVERED" ? "8:15 PM" : undefined,
              }}
            />
          </motion.section>
        )}

        {/* Menu Section */}
        <section id="menu-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="mb-4">Our Menu</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated selection of delicious dishes
            </p>
          </motion.div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Filters:</span>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Appetizers">Appetizers</SelectItem>
                <SelectItem value="Main Course">Main Course</SelectItem>
                <SelectItem value="Desserts">Desserts</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                <SelectItem value="Indian">Indian</SelectItem>
                <SelectItem value="Continental">Continental</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dietFilter} onValueChange={setDietFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Diet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => {
                setCategoryFilter("all");
                setCuisineFilter("all");
                setDietFilter("all");
              }}
              className="text-sm text-[#6B8E23] hover:underline"
            >
              Clear Filters
            </button>
          </div>

          {/* Food Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading menu items...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <FoodCard
                      item={item}
                      quantity={cart[item.id]?.quantity || 0}
                      onAdd={handleAddToCart}
                      onRemove={handleRemoveFromCart}
                      onQuantityChange={handleQuantityChange}
                    />
                  </motion.div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items match your filters</p>
                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                      setCuisineFilter("all");
                      setDietFilter("all");
                    }}
                    className="mt-4 text-[#6B8E23] hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Order History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <OrderHistory orders={orderHistory} />
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#6B8E23] to-[#556B2F] text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">Questions about your order?</p>
          <p className="text-sm text-white/80">Call Restaurant: Ext. 100 | Room Service: Ext. 200</p>
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white/70">
              HotelEase — Where Comfort Meets Cuisine.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemoveFromCart}
        onUpdateNotes={handleUpdateNotes}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
