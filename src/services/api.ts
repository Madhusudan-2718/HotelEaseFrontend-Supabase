// ============================================
// Supabase Service Layer - Backend Replacement
// ============================================
// This file provides a centralized Supabase client and API service layer
// All database operations, authentication, and API functionality will use Supabase

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========== Restaurant API ==========
export const restaurantApi = {
  // Get all menu items from Supabase
  getMenuItems: async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      return { data: [] };
    }
  },
  
  // Create a new order
  createOrder: async (orderData: {
    userId: string;
    roomNumber: string;
    items: Array<{ name: string; quantity: number; price: number; notes?: string }>;
    total: number;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          room_number: orderData.roomNumber,
          items: orderData.items,
          total: orderData.total,
          notes: orderData.notes,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Generate order number if not provided
      const orderNumber = data.order_number || `ORD${Date.now()}`;
      
      return {
        data: [{
          id: data.id,
          orderNumber,
          userId: data.user_id,
          roomNumber: data.room_number,
          items: data.items,
          totalPrice: data.total,
          status: data.status,
          createdAt: data.created_at,
        }],
        message: 'Order created successfully',
      };
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(error.message || 'Failed to create order');
    }
  },
  
  // Get orders for a room
  getOrders: async (roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('room_number', roomNumber)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        data: (data || []).map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number || `ORD${order.id}`,
          userId: order.user_id,
          roomNumber: order.room_number,
          itemName: order.items?.[0]?.name || 'Multiple items',
          quantity: order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 1,
          totalPrice: order.total,
          status: order.status,
          createdAt: order.created_at,
        })),
      };
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      return { data: [] };
    }
  },
  
  // Get order by ID
  getOrder: async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },
  
  // Update order status
  updateOrderStatus: async (orderId: string, status: string, assignedStaffId?: string) => {
    try {
      const updateData: any = { status };
      if (assignedStaffId) {
        updateData.assigned_staff_id = assignedStaffId;
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error updating order:', error);
      throw error;
    }
  },
};

// ========== Housekeeping API ==========
export const housekeepingApi = {
  // Get available services from Supabase
  getServices: async () => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_services')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching services:', error);
      return { data: [] };
    }
  },
  
  // Create a new request
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
        .from('housekeeping_requests')
        .insert({
          user_id: requestData.userId,
          room_number: requestData.roomNumber,
          request_type: requestData.serviceType,
          notes: requestData.notes,
          scheduled_time: requestData.scheduledTime,
          priority: requestData.priority || 'medium',
          status: 'pending',
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
        message: 'Request created successfully',
      };
    } catch (error: any) {
      console.error('Error creating request:', error);
      throw new Error(error.message || 'Failed to create request');
    }
  },
  
  // Get requests for a room
  getRequests: async (roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_requests')
        .select('*')
        .eq('room_number', roomNumber)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        data: (data || []).map((req: any) => ({
          id: req.id,
          requestType: req.request_type,
          userId: req.user_id,
          roomNumber: req.room_number,
          status: req.status,
          notes: req.notes,
          scheduledTime: req.scheduled_time,
          priority: req.priority,
          createdAt: req.created_at,
        })),
      };
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      return { data: [] };
    }
  },
  
  // Get request by ID
  getRequest: async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error fetching request:', error);
      throw error;
    }
  },
  
  // Update request status
  updateRequestStatus: async (requestId: string, status: string, assignedStaffId?: string) => {
    try {
      const updateData: any = { status };
      if (assignedStaffId) {
        updateData.assigned_staff_id = assignedStaffId;
      }
      
      const { data, error } = await supabase
        .from('housekeeping_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error updating request:', error);
      throw error;
    }
  },
};

// ========== Travel Desk API ==========
export const travelDeskApi = {
  // Get available services from Supabase
  getServices: async () => {
    try {
      const { data, error } = await supabase
        .from('travel_services')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching services:', error);
      return { data: [] };
    }
  },
  
  // Create a new booking
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
        .from('travel_bookings')
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
          status: 'new',
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
        message: 'Booking created successfully',
      };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  },
  
  // Get bookings for a room
  getBookings: async (roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('travel_bookings')
        .select('*')
        .eq('room_number', roomNumber)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        data: (data || []).map((booking: any) => ({
          id: booking.id,
          bookingId: booking.booking_id,
          userId: booking.user_id,
          roomNumber: booking.room_number,
          serviceType: booking.service_type,
          pickupLocation: booking.pickup_location,
          dropLocation: booking.drop_location,
          date: booking.booking_date,
          time: booking.booking_time,
          price: booking.estimated_price,
          status: booking.status,
          createdAt: booking.created_at,
        })),
      };
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return { data: [] };
    }
  },
  
  // Get booking by ID
  getBooking: async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('travel_bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },
  
  // Update booking status
  updateBookingStatus: async (bookingId: string, status: string, assignedStaffId?: string, vehicle?: string) => {
    try {
      const updateData: any = { status };
      if (assignedStaffId) {
        updateData.assigned_staff_id = assignedStaffId;
      }
      if (vehicle) {
        updateData.vehicle = vehicle;
      }
      
      const { data, error } = await supabase
        .from('travel_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },
};

// ========== Admin API ==========
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      // This would query Supabase for aggregated stats
      // For now, return placeholder structure
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        // If RPC doesn't exist, return default structure
        return {
          activeStaff: 0,
          pendingTasks: 0,
          completedToday: 0,
          ongoingRequests: 0,
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return {
        activeStaff: 0,
        pendingTasks: 0,
        completedToday: 0,
        ongoingRequests: 0,
      };
    }
  },
  
  // Get department task counts
  getDepartmentTasks: async () => {
    try {
      const { data, error } = await supabase.rpc('get_department_tasks');
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching department tasks:', error);
      return { data: [] };
    }
  },
  
  // Get recent updates
  getRecentUpdates: async () => {
    try {
      // This would query Supabase for recent activity
      return { data: [] };
    } catch (error: any) {
      console.error('Error fetching recent updates:', error);
      return { data: [] };
    }
  },
  
  // Get department status
  getDepartmentStatus: async () => {
    try {
      const { data, error } = await supabase.rpc('get_department_status');
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching department status:', error);
      return { data: [] };
    }
  },
  
  // Get all housekeeping tasks
  getHousekeepingTasks: async (filters?: {
    status?: string;
    search?: string;
  }) => {
    try {
      let query = supabase.from('housekeeping_requests').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.search) {
        query = query.or(`room_number.ilike.%${filters.search}%,request_type.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching housekeeping tasks:', error);
      return { data: [] };
    }
  },
  
  // Assign staff to housekeeping task
  assignHousekeepingTask: async (taskId: string, data: {
    assignedStaffId: string;
    status: string;
    priority?: string;
    deadline?: string;
    notes?: string;
  }) => {
    return housekeepingApi.updateRequestStatus(taskId, data.status, data.assignedStaffId);
  },
  
  // Get all restaurant orders
  getRestaurantOrders: async (filters?: {
    status?: string;
    search?: string;
  }) => {
    try {
      let query = supabase.from('orders').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.search) {
        query = query.or(`room_number.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching restaurant orders:', error);
      return { data: [] };
    }
  },
  
  // Assign staff to restaurant order
  assignRestaurantOrder: async (orderId: string, data: {
    assignedStaffId: string;
    status: string;
  }) => {
    return restaurantApi.updateOrderStatus(orderId, data.status, data.assignedStaffId);
  },
  
  // Get all travel bookings
  getTravelBookings: async (filters?: {
    status?: string;
    search?: string;
  }) => {
    try {
      let query = supabase.from('travel_bookings').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.search) {
        query = query.or(`room_number.ilike.%${filters.search}%,booking_id.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching travel bookings:', error);
      return { data: [] };
    }
  },
  
  // Assign driver to travel booking
  assignTravelBooking: async (bookingId: string, data: {
    assignedStaffId: string;
    vehicle: string;
    status: string;
    remarks?: string;
  }) => {
    return travelDeskApi.updateBookingStatus(bookingId, data.status, data.assignedStaffId, data.vehicle);
  },
  
  // Get notifications
  getNotifications: async (isRead?: boolean) => {
    try {
      let query = supabase.from('notifications').select('*');
      
      if (isRead !== undefined) {
        query = query.eq('is_read', isRead);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return { data: [] };
    }
  },
  
  // Mark notification as read
  markNotificationRead: async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};

// ========== Staff API ==========
export const staffApi = {
  // Get all staff members
  getStaffMembers: async (filters?: {
    department?: string;
    status?: string;
    rating?: string;
    search?: string;
  }) => {
    try {
      let query = supabase.from('staff').select('*');
      
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.rating) {
        const ratingNum = filters.rating === 'high' ? 4.5 : filters.rating === 'medium' ? 4.0 : 0;
        query = query.gte('rating', ratingNum);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,role.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      console.error('Error fetching staff members:', error);
      return { data: [] };
    }
  },
  
  // Get staff by ID
  getStaffById: async (staffId: string) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error fetching staff member:', error);
      throw error;
    }
  },
  
  // Create staff member
  createStaff: async (staffData: {
    name: string;
    role: string;
    department: string;
    contact: string;
    email?: string;
    shiftTiming?: string;
    rating?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: staffData.name,
          role: staffData.role,
          department: staffData.department,
          contact: staffData.contact,
          email: staffData.email,
          shift_timing: staffData.shiftTiming,
          rating: staffData.rating || 0,
          status: 'available',
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, message: 'Staff member created successfully' };
    } catch (error: any) {
      console.error('Error creating staff member:', error);
      throw new Error(error.message || 'Failed to create staff member');
    }
  },
  
  // Update staff member
  updateStaff: async (staffId: string, staffData: {
    name?: string;
    role?: string;
    department?: string;
    contact?: string;
    email?: string;
    shiftTiming?: string;
    rating?: number;
    availability?: boolean;
  }) => {
    try {
      const updateData: any = {};
      if (staffData.name) updateData.name = staffData.name;
      if (staffData.role) updateData.role = staffData.role;
      if (staffData.department) updateData.department = staffData.department;
      if (staffData.contact) updateData.contact = staffData.contact;
      if (staffData.email) updateData.email = staffData.email;
      if (staffData.shiftTiming) updateData.shift_timing = staffData.shiftTiming;
      if (staffData.rating !== undefined) updateData.rating = staffData.rating;
      if (staffData.availability !== undefined) {
        updateData.status = staffData.availability ? 'available' : 'busy';
      }
      
      const { data, error } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', staffId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  },
  
  // Delete staff member
  deleteStaff: async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);
      
      if (error) throw error;
      return { message: 'Staff member deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  },
};
