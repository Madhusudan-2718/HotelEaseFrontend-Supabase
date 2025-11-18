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
import { supabase } from "./services/api";
import React from "react";

type Page =
  | "home"
  | "housekeeping"
  | "restaurant"
  | "travel"
  | "admin-login"
  | "admin-dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Allow global navigation dispatch
  (window as any).navigateToPage = (page: Page) => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: page }));
  };

  useEffect(() => {
    registerServiceWorker();

    // 👇 Always open HOME on fresh load (Option 1)
    navigateToPage("home");

    const handleNavigate = (event: CustomEvent) => {
      navigateToPage(event.detail as Page);
    };

    window.addEventListener("navigate", handleNavigate as EventListener);

    // 🔥 Supabase Auth Listener
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAdminAuthenticated(true);
        navigateToPage("admin-dashboard");
      }

      if (event === "SIGNED_OUT") {
        setIsAdminAuthenticated(false);
        navigateToPage("admin-login");
      }
    });

    return () => {
      window.removeEventListener("navigate", handleNavigate as EventListener);
    };
  }, []);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    navigateToPage("admin-dashboard");
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    navigateToPage("admin-login");
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

      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
