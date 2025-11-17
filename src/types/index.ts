// ============================================
// Type Definitions for HotelEase Application
// ============================================

// ========== Restaurant Types ==========
export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  cuisine: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  roomNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  total: number;
  status: "new" | "preparing" | "out_for_delivery" | "delivered";
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  assignedChef?: string;
  assignedWaiter?: string;
}

// ========== Housekeeping Types ==========
export interface HousekeepingService {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  image: string;
}

export interface HousekeepingRequest {
  id: string;
  roomNumber: string;
  serviceType: string;
  status: "new" | "assigned" | "in_progress" | "completed";
  notes?: string;
  scheduledTime?: string;
  assignedTo?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

// ========== Travel Desk Types ==========
export interface TravelService {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  basePriceDisplay: string;
  icon?: React.ReactNode;
  image: string;
}

export interface TravelBooking {
  id: string;
  bookingId: string;
  roomNumber: string;
  guestName: string;
  serviceType: string;
  pickupLocation: string;
  dropLocation: string;
  status: "new" | "confirmed" | "driver_assigned" | "ongoing" | "completed";
  date: string;
  time: string;
  price: number;
  assignedDriver?: string;
  vehicle?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Admin Types ==========
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: "Housekeeping" | "Restaurant" | "Travel Desk";
  status: "available" | "busy" | "off_duty";
  phone: string;
  email: string;
  rating: number;
  recentTasks: number;
  shiftTiming: string;
}

export interface DashboardStats {
  activeStaff: number;
  pendingTasks: number;
  completedToday: number;
  ongoingRequests: number;
}

export interface DepartmentTaskCount {
  name: string;
  tasks: number;
  color: string;
}

export interface RecentUpdate {
  id: string;
  department: "Housekeeping" | "Restaurant" | "Travel Desk";
  message: string;
  time: string;
  status: "completed" | "in_progress" | "assigned";
  createdAt: string;
}

export interface DepartmentStatus {
  name: string;
  busy: number;
  available: number;
  color: string;
}

// ========== API Response Types ==========
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ========== Event Types for Real-time Updates ==========
export type EventType = 
  | "restaurant_order_created"
  | "restaurant_order_updated"
  | "housekeeping_request_created"
  | "housekeeping_request_updated"
  | "travel_booking_created"
  | "travel_booking_updated";

export interface AppEvent {
  type: EventType;
  payload: any;
  timestamp: string;
}

