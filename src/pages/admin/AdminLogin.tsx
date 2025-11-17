import { useState } from "react";
import { motion } from "motion/react";
import { Hotel, Lock, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { supabase } from "../../services/api";
import loginbackground from "../../assets/images/loginbackground.png";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const passwordRules = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!passwordRules.test(password)) {
      toast.error("Password must be at least 8 characters long and include a number and a special character.");
      setIsLoading(false);
      return;
    }

    if (!email) {
      toast.error("Please enter a valid email.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Login successful!");
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const goHome = () => {
    // fade-out animation then navigate
    setIsExiting(true);
    setTimeout(() => {
      if ((window as any).navigateToPage) {
        (window as any).navigateToPage("home");
      } else {
        window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }));
      }
    }, 300);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${loginbackground})` }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none"></div>

      {/* Back Button */}
      <button
        onClick={goHome}
        className="absolute top-4 left-3 sm:top-6 sm:left-6 z-[999] 
        flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 
        bg-[#FFD700]/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg
        transition-all duration-200 hover:bg-[#FFD700] active:bg-[#FFD700] 
        group border border-yellow-300/40"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B8E23]" />
        <span className="font-poppins text-sm sm:text-base font-semibold text-black group-hover:text-[#FFD700]">
          Back to Home
        </span>
      </button>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={
          isExiting
            ? { opacity: 0, y: 40, scale: 0.9 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="relative w-full max-w-sm z-50 mt-16 sm:mt-0"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFD700] via-[#6B8E23] to-[#FFD700] opacity-80" />

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
              className="flex items-center justify-center mb-5"
            >
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-2xl flex items-center justify-center shadow-xl">
                  <Hotel className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#6B8E23] rounded-full border-4 border-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-playfair text-xl sm:text-2xl font-bold text-[#FFD700] mb-2"
            >
              HotelEase Admin
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs sm:text-sm text-[#DAEFB3] font-poppins font-semibold"
            >
              Sign in to manage your hotel operations
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-white font-bold text-sm">Email</Label>
              <Input
                type="email"
                placeholder="admin@hotelease.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 sm:h-12 bg-white/80 border border-gray-300 text-[#2D2D2D]"
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
                className="h-11 sm:h-12 bg-white/80 border border-gray-300 text-[#2D2D2D]"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-white">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="font-semibold">Remember me</span>
              </label>
              <a className="font-bold hover:text-[#DAEFB3]">Forgot password?</a>
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:scale-[1.02]"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Google Login */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-6 relative z-[9999] pointer-events-auto">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-white text-black border border-gray-300 flex items-center justify-center gap-3 hover:bg-gray-100 transition"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
              Sign in with Google
            </Button>
          </motion.div>

          {/* Footer */}
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
