import { useState } from "react";
import { motion } from "motion/react";
import { Hotel, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { supabase } from "../../services/api";
import loginbackground from "../../assets/images/loginbackground.png";
import React from "react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

    } catch (error: any) {
      toast.error(error.message || "Google login failed");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Invalid credentials");
      setIsLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Login successful!");
      onLoginSuccess();
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${loginbackground})` }}
      />

      <div className="absolute inset-0 bg-black/60 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="relative w-full max-w-sm z-50 mt-16 sm:mt-0"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">

          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700]
                rounded-2xl flex items-center justify-center shadow-xl">
                <Hotel className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="font-playfair text-2xl font-bold text-[#FFD700] mb-2">
              HotelEase Admin
            </h1>
            <p className="text-sm text-[#DAEFB3] font-poppins font-semibold">
              Sign in to manage your hotel operations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <Label className="text-white font-bold text-sm">Email</Label>
              <Input
                type="email"
                placeholder="admin@hotelease.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/80 border border-gray-300 text-[#2D2D2D]"
                required
              />
            </div>

            <div>
              <Label className="text-white font-bold text-sm">Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/80 border border-gray-300 text-[#2D2D2D]"
                required
              />
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:scale-[1.02]"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-white text-black border border-gray-300 flex items-center justify-center gap-3 hover:bg-gray-100"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
              />
              Sign in with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#DAEFB3] flex items-center justify-center gap-2 font-semibold">
              <Lock className="w-3 h-3 text-[#DAEFB3]" /> Secure access for authorized personnel only
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
