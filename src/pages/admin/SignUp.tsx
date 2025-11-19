import { useState } from "react";
import { motion } from "motion/react";
import { Hotel, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import loginbackground from "../../assets/images/loginbackground.png";
import React from "react";

import { saveUser } from "../../utils/authLocal";

interface SignUpProps {
  onBack: () => void;
}

export default function SignUp({ onBack }: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // PASSWORD RULE CHECKS
  const validatePassword = () => {
    const hasNumber = /\d/;
    const hasLetter = /[A-Za-z]/;
    const hasSpecial = /[^A-Za-z0-9]/;

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if (!hasLetter.test(password)) {
      toast.error("Password must contain at least one alphabet.");
      return false;
    }
    if (!hasNumber.test(password)) {
      toast.error("Password must contain at least one number.");
      return false;
    }
    if (!hasSpecial.test(password)) {
      toast.error("Password must contain at least one special character.");
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await saveUser(name, email, password);
      toast.success("Account created successfully!");
      onBack(); // go to login page
    } catch (err: any) {
      toast.error(err.message || "Failed to create account.");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-2 overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${loginbackground})` }}
      />

      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-sm z-50"
      >
        <div className="bg-transparent backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700]
                rounded-xl flex items-center justify-center shadow-lg">
                <Hotel className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="font-playfair text-xl font-bold text-[#FFD700]">
              Create Account
            </h1>
            <p className="text-xs text-white font-poppins mt-1">
              Register to access admin dashboard
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Full Name */}
            <div>
              <Label className="text-white font-semibold text-sm">Full Name</Label>
              <Input
                type="text"
                placeholder="Thomas Shelby"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 px-3 bg-white/20 border border-gray-300 text-white placeholder-white/50"
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-white font-semibold text-sm">Email</Label>
              <Input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 px-3 bg-white/20 border border-gray-300 text-white placeholder-white/50"
              />
            </div>

            {/* Password */}
            <div>
              <Label className="text-white font-semibold text-sm">Password</Label>

              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 flex-1 px-3 bg-white/20 border border-gray-300 text-white placeholder-white/50 rounded-md outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white p-2 rounded-md hover:bg-white/20 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label className="text-white font-semibold text-sm">Confirm Password</Label>

              <div className="flex items-center gap-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-10 flex-1 px-3 bg-white/20 border border-gray-300 text-white placeholder-white/50 rounded-md outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="text-white p-2 rounded-md hover:bg-white/20 transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              disabled={loading}
              className="w-full h-10 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:scale-[1.01] text-sm font-semibold"
            >
              {loading ? "Creating..." : "Sign Up"}
            </Button>

          </form>

          {/* Back to Login */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white">
              Already have an account?{" "}
              <span
                onClick={onBack}
                className="text-[#FFD700] cursor-pointer font-semibold hover:underline"
              >
                Sign In
              </span>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
