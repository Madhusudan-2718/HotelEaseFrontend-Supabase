import { useState, useEffect } from "react";
import { Hotel, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";
import { supabase } from "../services/api";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Detect scroll
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Fetch role from Supabase session
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("app_users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (roleData) setRole(roleData.role);
      }
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to home sections
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  // Role-based Dashboard Redirect
  const goToDashboard = () => {
    if (role === "superadmin") (window as any).navigateToPage("superadmin-dashboard");
    else if (role === "admin") (window as any).navigateToPage("admin-dashboard");
    else if (role === "staff") (window as any).navigateToPage("staff-dashboard");
    else (window as any).navigateToPage("admin-login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => scrollToSection("hero")}
          >
            <Hotel
              className={`w-8 h-8 ${
                isScrolled ? "text-[#6B8E23]" : "text-white"
              }`}
            />
            <span
              className={`font-playfair ${
                isScrolled ? "text-[#2D2D2D]" : "text-white"
              }`}
              style={{ fontSize: "1.5rem", fontWeight: 600 }}
            >
              HotelEase
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("hero")}
              className={`hover:text-[#FFD700] ${
                isScrolled ? "text-[#2D2D2D]" : "text-white"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => scrollToSection("services")}
              className={`hover:text-[#FFD700] ${
                isScrolled ? "text-[#2D2D2D]" : "text-white"
              }`}
            >
              Services
            </button>

            <button
              onClick={() => scrollToSection("contact")}
              className={`hover:text-[#FFD700] ${
                isScrolled ? "text-[#2D2D2D]" : "text-white"
              }`}
            >
              Contact
            </button>

            {/* Role-aware button */}
            <Button
              onClick={goToDashboard}
              className="bg-[#FFD700] text-[#2D2D2D] hover:bg-[#FFD700]/90"
            >
              {role ? "Dashboard" : "Staff/Admin"}
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${
              isScrolled ? "text-[#2D2D2D]" : "text-white"
            }`}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white rounded-lg shadow-lg p-4 mt-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-left text-[#2D2D2D]"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-left text-[#2D2D2D]"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left text-[#2D2D2D]"
              >
                Contact
              </button>

              {/* Role-aware mobile menu */}
              <Button
                onClick={goToDashboard}
                className="bg-[#FFD700] text-[#2D2D2D] hover:bg-[#FFD700]/90"
              >
                {role ? "Dashboard" : "Staff/Admin"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
