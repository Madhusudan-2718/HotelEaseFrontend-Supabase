import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { InstallPrompt } from "./components/InstallPrompt";
import { BackToTop } from "./components/BackToTop";
import { registerServiceWorker } from "./utils/pwa";

import Housekeeping from "./pages/Housekeeping";
import Restaurant from "./pages/Restaurant";
import TravelDesk from "./pages/TravelDesk";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";

import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import { supabase } from "./services/api";
import React from "react";

type Page =
  | "home"
  | "housekeeping"
  | "restaurant"
  | "travel"
  | "admin-login"
  | "superadmin-dashboard"
  | "admin-dashboard"
  | "staff-dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // ❗NEW: This prevents double redirects after fresh login
  const [isFreshLogin, setIsFreshLogin] = useState(false);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  (window as any).navigateToPage = (page: Page) => navigateToPage(page);

  useEffect(() => {
    registerServiceWorker();
    checkAuthOnLoad();
  }, []);

  // ------------------------------------------------------------
  // CHECK SESSION + ROLE ON PAGE LOAD (REFRESH)
  // ------------------------------------------------------------
  const checkAuthOnLoad = async () => {
    setIsLoading(true);

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (session?.user) {
      const { data: userData } = await supabase
        .from("app_users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userData?.role) {
        setRole(userData.role);

        // ❗DO NOT REDIRECT if the login just happened
        if (!isFreshLogin) {
          redirectByRole(userData.role);
        }

      } else {
        navigateToPage("admin-login");
      }
    } else {
      navigateToPage("home");
    }

    setIsLoading(false);
  };

  // ------------------------------------------------------------
  // REDIRECT BASED ON ROLE
  // ------------------------------------------------------------
  const redirectByRole = (role: string) => {
    if (role === "superadmin") navigateToPage("superadmin-dashboard");
    else if (role === "admin") navigateToPage("admin-dashboard");
    else if (role === "staff") navigateToPage("staff-dashboard");
    else navigateToPage("home");
  };

  // ------------------------------------------------------------
  // LOGIN HANDLER (FROM AdminLogin.tsx)
  // ------------------------------------------------------------
  const handleLoginRole = (role: string) => {
    setIsFreshLogin(true); // ❗Stops auto-redirect from checkAuthOnLoad
    setRole(role);
    redirectByRole(role);
  };

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setIsFreshLogin(false);
    navigateToPage("home");
  };

  // ------------------------------------------------------------
  // LOADING SCREEN
  // ------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#6B8E23] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">Checking access…</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // PAGE RENDER
  // ------------------------------------------------------------
  return (
    <AppProvider>
      {/* DASHBOARDS (NO NAVBAR) */}
      {currentPage === "superadmin-dashboard" && (
        <SuperadminDashboard onLogout={handleLogout} />
      )}

      {currentPage === "admin-dashboard" && (
        <AdminDashboard onLogout={handleLogout} />
      )}

      {currentPage === "staff-dashboard" && (
        <StaffDashboard onLogout={handleLogout} />
      )}

      {/* AUTH PAGE */}
      {currentPage === "admin-login" && (
        <AdminLogin onLoginSuccess={handleLoginRole} />
      )}

      {/* PUBLIC PAGES WITH NAVBAR */}
      {currentPage === "home" && (
        <div className="min-h-screen">
          <Navbar />
          <Hero />
          <Services onNavigate={navigateToPage} />
          <Features />
          <Footer />
          <InstallPrompt />
          <BackToTop />
        </div>
      )}

      {currentPage === "housekeeping" && (
        <>
          <Navbar />
          <Housekeeping onBack={() => navigateToPage("home")} />
        </>
      )}

      {currentPage === "restaurant" && (
        <>
          <Navbar />
          <Restaurant onBack={() => navigateToPage("home")} />
        </>
      )}

      {currentPage === "travel" && (
        <>
          <Navbar />
          <TravelDesk onBack={() => navigateToPage("home")} />
        </>
      )}

      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
