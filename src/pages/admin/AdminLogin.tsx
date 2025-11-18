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
    <div
      className="
        relative
        h-[100dvh]
        w-full
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >
      {/* Background */}
      <div
        className="
          absolute
          inset-0
          w-full
          h-full
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{ backgroundImage: `url(${loginbackground})` }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CENTERED CARD */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="
          relative
          z-50
          w-[90%]
          max-w-sm
        "
      >
        <div
          className="
            bg-white/10 
            backdrop-blur-md 
            rounded-3xl 
            shadow-2xl 
            p-6 
            border 
            border-white/20
          "
        >
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div
                className="
                  w-16 h-16
                  bg-gradient-to-br
                  from-[#FFD700]
                  via-[#FFA500]
                  to-[#FFD700]
                  rounded-2xl
                  flex items-center justify-center
                  shadow-xl
                "
              >
                <Hotel className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="font-playfair text-2xl font-bold text-[#FFD700] mb-1">
              HotelEase Admin
            </h1>

            <p className="text-sm text-[#DAEFB3] font-poppins font-semibold">
              Sign in to manage your hotel operations
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white font-bold text-sm">Email</Label>
              <Input
                type="email"
                placeholder="admin@hotelease.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  h-11
                  bg-white/80
                  border border-gray-300
                  text-[#2D2D2D]
                  rounded-lg
                "
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
                className="
                  h-11
                  bg-white/80
                  border border-gray-300
                  text-[#2D2D2D]
                  rounded-lg
                "
                required
              />
            </div>

            {/* Sign In button */}
            <Button
              disabled={isLoading}
              className="
                w-full
                h-10
                bg-gradient-to-r
                from-[#FFD700]
                to-[#FFA500]
                text-black
                font-semibold
                rounded-lg
                hover:brightness-105
              "
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Google Button */}
          <div className="mt-4">
            <Button
              onClick={handleGoogleLogin}
              className="
                w-full
                h-10
                bg-white
                text-black
                border border-gray-300
                flex items-center justify-center gap-3
                hover:bg-gray-100
                rounded-lg
              "
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
              />
              Sign in with Google
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center">
            <p className="text-xs text-[#DAEFB3] flex items-center justify-center gap-2 font-semibold">
              <Lock className="w-3 h-3 text-[#DAEFB3]" />
              Secure access for authorized personnel only
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
