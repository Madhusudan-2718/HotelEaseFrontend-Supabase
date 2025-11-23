import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase environment variables are not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* =========================
   Restaurant API
   (kept minimal & stable)
   ========================= */
export const restaurantApi = {
  getMenuItems: async () => {
    try {
      const { data, error } = await supabase.from("menu_items").select("*").order("name");
      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("restaurantApi.getMenuItems:", err);
      return { data: [] };
    }
  },

  createOrder: async (orderData: {
    userId: string;
    roomNumber: string;
    items: Array<{ name: string; quantity: number; price: number; notes?: string }>;
    total: number;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: orderData.userId,
          room_number: orderData.roomNumber,
          items: orderData.items,
          total: orderData.total,
          notes: orderData.notes,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const orderNumber = data.order_number || `ORD${Date.now()}`;

      return {
        data: [
          {
            id: data.id,
            orderNumber,
            userId: data.user_id,
            roomNumber: data.room_number,
            items: data.items,
            totalPrice: data.total,
            status: data.status,
            createdAt: data.created_at,
          },
        ],
        message: "Order created successfully",
      };
    } catch (err: any) {
      console.error("restaurantApi.createOrder:", err);
      throw err;
    }
  },

  getOrders: async (roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("room_number", roomNumber)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("restaurantApi.getOrders:", err);
      return { data: [] };
    }
  },

  getOrder: async (orderId: string) => {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (error) throw error;
      return { data };
    } catch (err: any) {
      console.error("restaurantApi.getOrder:", err);
      throw err;
    }
  },

  updateOrderStatus: async (orderId: string, status: string, assignedStaffId?: string) => {
    try {
      const updateData: any = { status };
      if (assignedStaffId) updateData.assigned_staff_id = assignedStaffId;

      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (err: any) {
      console.error("restaurantApi.updateOrderStatus:", err);
      throw err;
    }
  },
};

/* =========================
   Housekeeping API
   ========================= */
export const housekeepingApi = {
  getServices: async () => {
    try {
      const { data, error } = await supabase.from("housekeeping_services").select("*").order("title");
      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("housekeepingApi.getServices:", err);
      return { data: [] };
    }
  },

  createRequest: async (requestData: {
    userId: string;
    roomNumber: string;
    serviceType: string;
    notes?: string;
    scheduledTime?: string;
    priority?: "low" | "medium" | "high";
  }) => {
    try {
      const { data, error } = await supabase
        .from("housekeeping_requests")
        .insert({
          user_id: requestData.userId,
          room_number: requestData.roomNumber,
          request_type: requestData.serviceType,
          notes: requestData.notes,
          scheduled_time: requestData.scheduledTime,
          priority: requestData.priority || "medium",
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          requestType: data.request_type,
          userId: data.user_id,
          roomNumber: data.room_number,
          status: data.status,
          notes: data.notes,
          scheduledTime: data.scheduled_time,
          priority: data.priority,
          createdAt: data.created_at,
        },
        message: "Request created successfully",
      };
    } catch (err: any) {
      console.error("housekeepingApi.createRequest:", err);
      throw err;
    }
  },

  getRequests: async (roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from("housekeeping_requests")
        .select("*")
        .eq("room_number", roomNumber)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("housekeepingApi.getRequests:", err);
      return { data: [] };
    }
  },

  getRequest: async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from("housekeeping_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error) throw error;
      return { data };
    } catch (err: any) {
      console.error("housekeepingApi.getRequest:", err);
      throw err;
    }
  },

  updateRequestStatus: async (requestId: string, status: string, assignedStaffId?: string) => {
    try {
      const updateData: any = { status };
      if (assignedStaffId) updateData.assigned_staff_id = assignedStaffId;

      const { data, error } = await supabase
        .from("housekeeping_requests")
        .update(updateData)
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (err: any) {
      console.error("housekeepingApi.updateRequestStatus:", err);
      throw err;
    }
  },
};

/* =========================
   Travel Desk API
   ========================= */
export const travelDeskApi = {
  getServices: async () => {
    try {
      const { data, error } = await supabase.from("travel_services").select("*").order("title");
      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("travelDeskApi.getServices:", err);
      return { data: [] };
    }
  },

  createBooking: async (bookingData: {
    userId: string;
    roomNumber: string;
    guestName?: string;
    serviceType: string;
    pickupLocation: string;
    dropLocation: string;
    date: string;
    time: string;
    estimatedPrice: number;
  }) => {
    try {
      const bookingId = `TRV${Math.floor(1000 + Math.random() * 9000)}`;

      const { data, error } = await supabase
        .from("travel_bookings")
        .insert({
          booking_id: bookingId,
          user_id: bookingData.userId,
          room_number: bookingData.roomNumber,
          guest_name: bookingData.guestName,
          service_type: bookingData.serviceType,
          pickup_location: bookingData.pickupLocation,
          drop_location: bookingData.dropLocation,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          estimated_price: bookingData.estimatedPrice,
          status: "new",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          bookingId: data.booking_id,
          userId: data.user_id,
          roomNumber: data.room_number,
          serviceType: data.service_type,
          pickupLocation: data.pickup_location,
          dropLocation: data.drop_location,
          date: data.booking_date,
          time: data.booking_time,
          price: data.estimated_price,
          status: data.status,
          createdAt: data.created_at,
        },
        message: "Booking created successfully",
      };
    } catch (err: any) {
      console.error("travelDeskApi.createBooking:", err);
      throw err;
    }
  },

  getBookings: async (roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from("travel_bookings")
        .select("*")
        .eq("room_number", roomNumber)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("travelDeskApi.getBookings:", err);
      return { data: [] };
    }
  },

  getBooking: async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from("travel_bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      return { data };
    } catch (err: any) {
      console.error("travelDeskApi.getBooking:", err);
      throw err;
    }
  },

  updateBookingStatus: async (
    bookingId: string,
    status: string,
    assignedStaffId?: string,
    vehicle?: string
  ) => {
    try {
      const updateData: any = { status };
      if (assignedStaffId) updateData.assigned_staff_id = assignedStaffId;
      if (vehicle) updateData.vehicle = vehicle;

      const { data, error } = await supabase
        .from("travel_bookings")
        .update(updateData)
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (err: any) {
      console.error("travelDeskApi.updateBookingStatus:", err);
      throw err;
    }
  },
};

/* =========================
   Admin helpers / APIs
   ========================= */
export const adminApi = {
  getDashboardStats: async () => {
    try {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      if (error) {
        return {
          activeStaff: 0,
          pendingTasks: 0,
          completedToday: 0,
          ongoingRequests: 0,
        };
      }
      return data;
    } catch (err: any) {
      console.error("adminApi.getDashboardStats:", err);
      return {
        activeStaff: 0,
        pendingTasks: 0,
        completedToday: 0,
        ongoingRequests: 0,
      };
    }
  },

  getDepartmentTasks: async () => {
    try {
      const { data, error } = await supabase.rpc("get_department_tasks");
      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("adminApi.getDepartmentTasks:", err);
      return { data: [] };
    }
  },

  // Other admin helpers can be called here — kept minimal to match previous behavior
};

/* =========================
   Staff helpers
   ========================= */
export const staffApi = {
  getStaffMembers: async (filters?: {
    department?: string;
    status?: string;
    rating?: string;
    search?: string;
  }) => {
    try {
      let query = supabase.from("staff").select("*");

      if (filters?.department) query = query.eq("department", filters.department);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.rating) {
        const ratingNum = filters.rating === "high" ? 4.5 : filters.rating === "medium" ? 4.0 : 0;
        query = query.gte("rating", ratingNum);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,role.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;
      return { data: data || [] };
    } catch (err: any) {
      console.error("staffApi.getStaffMembers:", err);
      return { data: [] };
    }
  },

  getStaffById: async (staffId: string) => {
    try {
      const { data, error } = await supabase.from("staff").select("*").eq("id", staffId).single();
      if (error) throw error;
      return { data };
    } catch (err: any) {
      console.error("staffApi.getStaffById:", err);
      throw err;
    }
  },
};
