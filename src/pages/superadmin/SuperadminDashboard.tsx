import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Lock,
  RefreshCcw,
  LogOut,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { supabase } from "../../services/api";

import adminbg from "../../assets/images/adminbg.png";

interface SuperadminDashboardProps {
  onLogout: () => void;
}

export default function SuperadminDashboard({
  onLogout,
}: SuperadminDashboardProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Create fields
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"staff" | "admin">("staff");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Housekeeping");
  const [subRole, setSubRole] = useState("");
  const [shiftTiming, setShiftTiming] = useState("");
  const [status, setStatus] = useState("available");

  // Load session
  useEffect(() => {
    const loadAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
        setAuthReady(true);
      }
    };
    loadAuth();
  }, []);

  // Auth headers
  const AUTH_HEADERS = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Load users
  const loadUsers = async () => {
    if (!authReady || !currentUserId) return;

    setLoadingList(true);

    try {
      const res = await fetch(
        "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/list-users",
        {
          method: "POST",
          headers: await AUTH_HEADERS(),
          body: JSON.stringify({ creatorId: currentUserId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load users");
        return;
      }

      setUsers(data.users ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }

    setLoadingList(false);
  };

  useEffect(() => {
    if (authReady) loadUsers();
  }, [authReady]);

  // ---------------------
  // CREATE USER
  // ---------------------
  const createUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error("Fill email & password");
      return;
    }

    // If creating staff, require staff fields (but allow empty subRole/phone if you prefer)
    if (newRole === "staff" && (!department || !subRole)) {
      toast.error("For staff, department and sub role are required");
      return;
    }

    try {
      // Build payload for edge function, include only relevant staff fields if role is staff
      const payload: any = {
        creatorId: currentUserId,
        email: newEmail,
        password: newPassword,
        role: newRole,
        name: name || null,
      };

      if (newRole === "staff") {
        payload.department = department;
        payload.subrole = subRole;
        payload.phone = phone || null;
        payload.shiftTiming = shiftTiming || null;
        payload.status = status || "available";
      }

      const res = await fetch(
        "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/create-user",
        {
          method: "POST",
          headers: await AUTH_HEADERS(),
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create user");
        return;
      }

      // created id returned in data.id
      const createdUserId = data.id || data.userId || data.id;

      if (!createdUserId) {
        toast.error("User created but no ID returned");
        loadUsers();
        return;
      }

      toast.success("User created successfully");
      // reset fields (clear staff fields only when appropriate)
      setNewEmail("");
      setNewPassword("");
      setNewRole("staff");
      setName("");
      setPhone("");
      setDepartment("Housekeeping");
      setSubRole("");
      setShiftTiming("");
      setStatus("available");

      loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Unexpected error");
    }
  };

  // ---------------------
  // RESET PASSWORD
  // ---------------------
  const resetPassword = async (userId: string) => {
    const newPass = prompt("Enter new password:");
    if (!newPass) return;

    try {
      const res = await fetch(
        "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/reset-password",
        {
          method: "POST",
          headers: await AUTH_HEADERS(),
          body: JSON.stringify({
            creatorId: currentUserId,
            userId,
            newPassword: newPass,
          }),
        }
      );

      if (!res.ok) toast.error("Password reset failed");
      else toast.success("Password updated");
    } catch {
      toast.error("Unexpected error");
    }
  };

  // ---------------------
  // UPDATE ROLE/STATUS
  // ---------------------
  const updateRole = async (
    userId: string,
    role: string,
    status: string
  ) => {
    try {
      const res = await fetch(
        "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/update-role",
        {
          method: "POST",
          headers: await AUTH_HEADERS(),
          body: JSON.stringify({
            creatorId: currentUserId,
            userId,
            newRole: role,
            status,
          }),
        }
      );

      if (!res.ok) toast.error("Update failed");
      else {
        toast.success("User updated");
        loadUsers();
      }
    } catch {
      toast.error("Unexpected error");
    }
  };

  // ---------------------
  // DELETE USER
  // ---------------------
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(
        "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/delete-user",
        {
          method: "POST",
          headers: await AUTH_HEADERS(),
          body: JSON.stringify({
            creatorId: currentUserId,
            userId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete user");
        return;
      }

      toast.success("User deleted successfully");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Unexpected error");
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.email} ${u.role} ${u.status} ${u.name || u.metadata?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${adminbg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"></div>
      </div>

      <div className="relative z-20 min-h-screen overflow-x-hidden">
        {/* HEADER */}
        <header className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center p-6 pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-white flex items-center gap-3">
              <span className="p-2 rounded-lg bg-white/10 text-[#FFD700]">
                <ShieldCheck />
              </span>
              Superadmin Panel
            </h1>
            <p className="text-white/80 mt-1">Manage admins & staff accounts</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="bg-white/10 text-white border border-white/10"
              onClick={loadUsers}
            >
              <RefreshCcw className="mr-2" /> Refresh
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onLogout}
            >
              <LogOut className="mr-2" /> Logout
            </Button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="px-4 sm:px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CREATE USER PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <UserPlus className="text-[#FFD700]" /> Create User
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label className="text-white">Name</Label>
                <Input
                  className="bg-white/5 text-white"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-white">Email</Label>
                <Input
                  className="bg-white/5 text-white"
                  placeholder="email@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <Label className="text-white">Password</Label>
                <Input
                  type="password"
                  className="bg-white/5 text-white"
                  placeholder="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {/* Role */}
              <div>
                <Label className="text-white">Role</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  value={newRole}
                  onChange={(e) => {
                    const v = e.target.value as "staff" | "admin";
                    setNewRole(v);
                    // If switching to admin, clear staff-only fields
                    if (v === "admin") {
                      setDepartment("Housekeeping");
                      setSubRole("");
                      setPhone("");
                      setShiftTiming("");
                      setStatus("available");
                    }
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {/* STAFF-ONLY FIELDS */}
              {newRole === "staff" && (
                <>
                  {/* Department */}
                  <div>
                    <Label className="text-white">Department</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md bg-gray-50"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option>Housekeeping</option>
                      <option>Restaurant</option>
                      <option>Travel Desk</option>
                    </select>
                  </div>

                  {/* Sub-Role */}
                  <div>
                    <Label className="text-white">Sub Role</Label>
                    <Input
                      className="bg-white/5 text-white"
                      placeholder="Chef / Waiter / Driver / Supervisor"
                      value={subRole}
                      onChange={(e) => setSubRole(e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-white">Phone</Label>
                    <Input
                      className="bg-white/5 text-white"
                      placeholder="+91 XXXXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Shift */}
                  <div>
                    <Label className="text-white">Shift Timing</Label>
                    <Input
                      className="bg-white/5 text-white"
                      placeholder="6:00 AM - 2:00 PM"
                      value={shiftTiming}
                      onChange={(e) => setShiftTiming(e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <Label className="text-white">Status</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md bg-gray-50"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="off_duty">Off Duty</option>
                    </select>
                  </div>
                </>
              )}

              {/* Create Button */}
              <Button
                onClick={createUser}
                className="w-full bg-[#FFD700] text-black font-semibold hover:bg-[#e2c200]"
              >
                Create User
              </Button>
            </div>
          </motion.div>

          {/* LIST PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="text-[#FFD700]" /> All Users
              </h2>

              <div className="w-full sm:w-72 md:w-80">
                <Input
                  className="bg-white/5 text-white placeholder-white/60 w-full border-white/20"
                  placeholder="Search users"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden sm:block overflow-x-auto rounded-lg mt-4">
              <table className="w-full min-w-[900px] border-collapse">
                <thead className="bg-white/5">
                  <tr className="text-white/80">
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-white/20">
                      <td className="p-3 text-white">{u.email}</td>
                      <td className="p-3 text-white">{u.name || u.metadata?.name || "---"}</td>
                      <td className="p-3 text-white">{u.role}</td>
                      <td className="p-3 text-white">{u.department || u.metadata?.department || "---"}</td>
                      <td className="p-3 text-white">{u.status}</td>

                      <td className="p-3">
                        <div className="flex flex-row flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() =>
                              updateRole(
                                u.id,
                                u.role === "admin" ? "staff" : "admin",
                                u.status
                              )
                            }
                          >
                            <ShieldCheck className="mr-1 w-3 h-3" /> Switch
                          </Button>

                          <Button
                            size="sm"
                            className="bg-orange-600 text-white hover:bg-orange-700"
                            onClick={() =>
                              updateRole(
                                u.id,
                                u.role,
                                u.status === "active" ? "suspended" : "active"
                              )
                            }
                          >
                            <RefreshCcw className="mr-1 w-3 h-3" />
                            {u.status === "active" ? "Suspend" : "Activate"}
                          </Button>

                          <Button
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => resetPassword(u.id)}
                          >
                            <Lock className="mr-1 w-3 h-3" /> Reset
                          </Button>

                          {/* DELETE BUTTON */}
                          <Button
                            size="sm"
                            className="bg-red-700 text-white hover:bg-red-800"
                            onClick={() => deleteUser(u.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="sm:hidden space-y-4 mt-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg"
                >
                  <p className="text-white text-sm">
                    <span className="font-semibold">Email:</span> {u.email}
                  </p>

                  <p className="text-white text-sm">
                    <span className="font-semibold">Name:</span>{" "}
                    {u.name || u.metadata?.name || "---"}
                  </p>

                  <p className="text-white text-sm">
                    <span className="font-semibold">Role:</span> {u.role}
                  </p>

                  <p className="text-white text-sm mb-3">
                    <span className="font-semibold">Status:</span> {u.status}
                  </p>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-blue-600 text-white w-full"
                      onClick={() =>
                        updateRole(
                          u.id,
                          u.role === "admin" ? "staff" : "admin",
                          u.status
                        )
                      }
                    >
                      <ShieldCheck className="mr-1" /> Switch Role
                    </Button>

                    <Button
                      className="bg-orange-600 text-white w-full"
                      onClick={() =>
                        updateRole(
                          u.id,
                          u.role,
                          u.status === "active" ? "suspended" : "active"
                        )
                      }
                    >
                      <RefreshCcw className="mr-1" />
                      {u.status === "active" ? "Suspend" : "Activate"}
                    </Button>

                    <Button
                      className="bg-red-600 text-white w-full"
                      onClick={() => resetPassword(u.id)}
                    >
                      <Lock className="mr-1" /> Reset Password
                    </Button>

                    {/* DELETE BUTTON */}
                    <Button
                      className="bg-red-700 text-white w-full"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete User
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
