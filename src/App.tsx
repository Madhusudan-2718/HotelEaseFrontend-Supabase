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
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";

import React from "react";
import SignUp from "./pages/admin/SignUp";

// LOCAL AUTH
import { getSession, clearSession } from "./utils/authLocal";

// GOOGLE AUTH ONLY
import { supabase } from "./services/api";

type Page =
  | "home"
  | "housekeeping"
  | "restaurant"
  | "travel"
  | "admin-login"
  | "admin-dashboard"
  | "signup";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // GLOBAL NAV (no change)
  (window as any).navigateToPage = (page: Page) => {
    navigateToPage(page);
  };

  // --------------------------------------------------------------------------------
  // ON LOAD → CHECK LOCAL SESSION FIRST
  // --------------------------------------------------------------------------------
  useEffect(() => {
    registerServiceWorker();

    const localUser = getSession();

    if (localUser) {
      setIsAdminAuthenticated(true);
      navigateToPage("admin-dashboard");
      return;
    }

    // If no local user, check Supabase Google session ONLY
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAdminAuthenticated(true);
        navigateToPage("admin-dashboard");
      } else {
        navigateToPage("home");
      }
    });

    // Supabase listener ONLY for Google logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setIsAdminAuthenticated(true);
          navigateToPage("admin-dashboard");
        }

        if (event === "SIGNED_OUT") {
          setIsAdminAuthenticated(false);
          navigateToPage("home");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // --------------------------------------------------------------------------------
  // LOCAL LOGIN SUCCESS HANDLER
  // --------------------------------------------------------------------------------
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    navigateToPage("admin-dashboard");
  };

  // --------------------------------------------------------------------------------
  // LOGOUT → Clear both local + Supabase Google
  // --------------------------------------------------------------------------------
  const handleAdminLogout = async () => {
    clearSession();
    await supabase.auth.signOut(); // for Google users
    setIsAdminAuthenticated(false);
    navigateToPage("home");
  };

  return (
    <AppProvider>
      {currentPage === "housekeeping" && (
        <Housekeeping onBack={() => navigateToPage("home")} />
      )}

      {currentPage === "restaurant" && (
        <Restaurant onBack={() => navigateToPage("home")} />
      )}

      {currentPage === "travel" && (
        <TravelDesk onBack={() => navigateToPage("home")} />
      )}

      {currentPage === "admin-login" && (
        <AdminLogin onLoginSuccess={handleAdminLogin} />
      )}

      {currentPage === "admin-dashboard" && isAdminAuthenticated && (
        <AdminDashboard onLogout={handleAdminLogout} />
      )}

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

      {currentPage === "signup" && (
        <SignUp onBack={() => navigateToPage("admin-login")} />
      )}

      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
