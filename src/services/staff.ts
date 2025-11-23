// src/services/staff.ts
import { supabase } from "./api";

/**
 * Staff metadata shape stored inside auth user_metadata
 */
export type StaffMetadata = {
  role?: string; // "staff"
  department?: string; // Housekeeping / Restaurant / Travel Desk
  subRole?: string; // e.g., Head Chef, Chef, Waiter, Cleaner
  name?: string;
  phone?: string;
  shiftTiming?: string;
  status?: "available" | "busy" | "off_duty" | string;
  rating?: number;
  recentTasks?: number;
};

/**
 * Call your existing edge function to create the user (email + password).
 * The edge function should return created user id or the user object.
 * If you already have a working create-user function, keep it.
 */
export async function createAuthUserViaEdge(creatorId: string | null, email: string, password: string, role = "staff") {
  // Adjust the URL to your existing function if needed
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const res = await fetch(
    "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/create-user",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ creatorId, email, password, role }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create user");
  return data; // expected { user: { id, email, ... } } or similar
}

/**
 * Update user's metadata using Supabase Admin API
 */
export async function updateUserMetadata(userId: string, metadata: StaffMetadata) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });
  if (error) throw error;
  return data;
}

/**
 * List all users, filtered to staff only (metadata.role === 'staff').
 * Returns simplified staff objects suitable for UI consumption.
 */
export async function listStaffUsers() {
  // listUsers returns up to 100 by default. You may need pagination for many users.
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;

  const users = (data?.users ?? []).filter(
    (u: any) => u.user_metadata?.role === "staff"
  );

  // Map to a convenient shape
  return users.map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.name || "",
    role: u.user_metadata?.role || "staff",
    department: u.user_metadata?.department || "General",
    subRole: u.user_metadata?.subRole || "",
    phone: u.user_metadata?.phone || "",
    shiftTiming: u.user_metadata?.shiftTiming || "Not Assigned",
    status: u.user_metadata?.status || "available",
    rating: u.user_metadata?.rating ?? 0,
    recentTasks: u.user_metadata?.recentTasks ?? 0,
  }));
}

/**
 * Reset password via your existing edge function (keeps server-side logic).
 */
export async function resetPasswordViaEdge(creatorId: string | null, userId: string, newPassword: string) {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const res = await fetch(
    "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/reset-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ creatorId, userId, newPassword }),
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to reset password");
  }
  return true;
}
