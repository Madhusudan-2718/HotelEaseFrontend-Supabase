import React, { useState } from "react";
import { motion } from "motion/react";
import { Hotel, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import loginbackground from "../../assets/images/loginbackground.png";
import { supabase } from "../../services/api";

interface AdminLoginProps {
  onLoginSuccess: (role: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid credentials.");
        setIsLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        toast.error("Login failed.");
        setIsLoading(false);
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("app_users")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData) {
        toast.error("Unauthorized access. No role assigned.");
        setIsLoading(false);
        return;
      }

      if (roleData.status === "suspended") {
        toast.error("Your account has been suspended.");
        setIsLoading(false);
        return;
      }

      toast.success("Login successful!");
      setIsLoading(false);
      onLoginSuccess(roleData.role);

    } catch (err: any) {
      toast.error(err?.message || "Login failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${loginbackground})` }}
      />
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-sm z-50 mt-16 sm:mt-0"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700]
                rounded-2xl flex items-center justify-center shadow-xl">
                <Hotel className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="font-playfair text-2xl font-bold text-[#FFD700] mb-2">
              HotelEase Admin Login
            </h1>
            <p className="text-sm text-[#DAEFB3] font-poppins font-semibold">
              Authorized access only
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div>
              <Label className="text-white font-bold text-sm">Email</Label>
              <Input
                type="email"
                placeholder="admin@hotelease.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full bg-white/80 border border-gray-300 text-black placeholder-gray-600"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label className="text-white font-bold text-sm">Password</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full bg-white/80 border border-gray-300 text-black placeholder-gray-600"
                required
              />
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:scale-[1.02] transition-all font-semibold shadow-lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#DAEFB3] flex items-center justify-center gap-2 font-semibold">
              <Lock className="w-3 h-3 text-[#DAEFB3]" /> Authorized personnel only
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
