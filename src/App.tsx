import React, { useEffect, useState } from "react";
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
  const [isFreshLogin, setIsFreshLogin] = useState(false);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  (window as any).navigateToPage = (page: Page) => navigateToPage(page);

  useEffect(() => {
    registerServiceWorker();
    checkAuthOnLoad();

    // Keep session in sync with Supabase (optional)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setRole(null);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthOnLoad = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        const { data: userData, error } = await supabase
          .from("app_users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!error && userData?.role) {
          setRole(userData.role);
          if (!isFreshLogin) {
            redirectByRole(userData.role);
          }
        } else {
          navigateToPage("admin-login");
        }
      } else {
        navigateToPage("home");
      }
    } catch (err) {
      console.error("checkAuthOnLoad:", err);
      navigateToPage("home");
    } finally {
      setIsLoading(false);
    }
  };

  const redirectByRole = (r: string) => {
    if (r === "superadmin") navigateToPage("superadmin-dashboard");
    else if (r === "admin") navigateToPage("admin-dashboard");
    else if (r === "staff") navigateToPage("staff-dashboard");
    else navigateToPage("home");
  };

  const handleLoginRole = (r: string) => {
    setIsFreshLogin(true);
    setRole(r);
    redirectByRole(r);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setRole(null);
      setIsFreshLogin(false);
      navigateToPage("home");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#6B8E23] border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-700 font-semibold">Checking access…</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      {/* DASHBOARDS (NO NAV) */}
      {currentPage === "superadmin-dashboard" && (
        <SuperadminDashboard onLogout={handleLogout} />
      )}

      {currentPage === "admin-dashboard" && <AdminDashboard onLogout={handleLogout} />}

      {currentPage === "staff-dashboard" && <StaffDashboard onLogout={handleLogout} />}

      {/* AUTH */}
      {currentPage === "admin-login" && <AdminLogin onLoginSuccess={handleLoginRole} />}

      {/* PUBLIC PAGES WITH NAV */}
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
