import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Lock,
  RefreshCcw,
  LogOut,
  Search,
  RefreshCw,
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

export default function SuperadminDashboard({ onLogout }: SuperadminDashboardProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("admin");

  // Fetch logged-in superadmin ID
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

  const AUTH_HEADERS = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Load users list
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
    } catch {
      toast.error("Unexpected error");
    }

    setLoadingList(false);
  };

  useEffect(() => {
    if (authReady) loadUsers();
  }, [authReady, currentUserId]);

  // Create user
  const createUser = async () => {
    if (!authReady || !currentUserId) {
      toast.error("Superadmin not authenticated yet. Please wait.");
      return;
    }

    if (!newEmail || !newPassword) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const res = await fetch(
        "https://aveacvjwbsoipcpnghti.supabase.co/functions/v1/create-user",
        {
          method: "POST",
          headers: await AUTH_HEADERS(),
          body: JSON.stringify({
            creatorId: currentUserId,
            email: newEmail,
            password: newPassword,
            role: newRole,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create user");
        return;
      }

      toast.success("User created successfully");
      setNewEmail("");
      setNewPassword("");
      setNewRole("admin");
      loadUsers();
    } catch {
      toast.error("Unexpected error");
    }
  };

  // Reset password
  const resetPassword = async (userId: string) => {
    if (!authReady || !currentUserId) return;

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

      if (!res.ok) {
        toast.error("Failed to reset password");
      } else {
        toast.success("Password updated");
      }
    } catch {
      toast.error("Unexpected error");
    }
  };

  // Update role and status
  const updateRole = async (userId: string, role: string, status: string) => {
    if (!authReady || !currentUserId) return;

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

      if (!res.ok) {
        toast.error("Update failed");
      } else {
        toast.success("User updated");
        loadUsers();
      }
    } catch {
      toast.error("Unexpected error");
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.email} ${u.role} ${u.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${adminbg})`,
          maxWidth: "100%",
        }}
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
            <Button className="bg-white/10 text-white border border-white/10" onClick={loadUsers}>
              <RefreshCw className="mr-2" /> Refresh
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onLogout}>
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
              <div>
                <Label className="text-white">Email</Label>
                <Input
                  className="bg-white/5 text-white placeholder-white/60"
                  placeholder="email@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-white">Password</Label>
                <Input
                  type="password"
                  className="bg-white/5 text-white placeholder-white/60"
                  placeholder="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-white">Role</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <Button
                onClick={createUser}
                className="w-full bg-[#FFD700] text-black font-semibold hover:bg-[#e2c200]"
              >
                Create User
              </Button>
            </div>
          </motion.div>

          {/* USER LIST */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="text-[#FFD700]" /> All Users
              </h2>

              <div className="relative w-full sm:w-auto">
                <Input
                  className="pl-10 bg-white/5 text-white placeholder-white/60 w-full"
                  placeholder="Search users"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              </div>
            </div>

            {loadingList ? (
              <p className="text-white/70">Loading users…</p>
            ) : (
              <div className="w-full overflow-x-auto rounded-lg mt-4">
                <table className="w-full border-collapse min-w-[650px]">
                  <thead>
                    <tr className="text-white/80">
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-white/20">
                        <td className="p-3 text-white">{u.email}</td>
                        <td className="p-3 text-white capitalize">{u.role}</td>
                        <td className="p-3 text-white">{u.status}</td>

                        <td className="p-3 flex flex-col sm:flex-row flex-wrap gap-2">
                          <Button
                            className="bg-blue-600 text-white w-full sm:w-auto"
                            onClick={() =>
                              updateRole(
                                u.id,
                                u.role === "admin" ? "staff" : "admin",
                                u.status
                              )
                            }
                          >
                            <ShieldCheck className="mr-1" /> Switch
                          </Button>

                          <Button
                            className="bg-orange-600 text-white w-full sm:w-auto"
                            onClick={() =>
                              updateRole(
                                u.id,
                                u.role,
                                u.status === "active"
                                  ? "suspended"
                                  : "active"
                              )
                            }
                          >
                            <RefreshCcw className="mr-1" />
                            {u.status === "active" ? "Suspend" : "Activate"}
                          </Button>

                          <Button
                            className="bg-red-600 text-white w-full sm:w-auto"
                            onClick={() => resetPassword(u.id)}
                          >
                            <Lock className="mr-1" /> Reset
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
