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

  // Navigation helper for components
  (window as any).navigateToPage = (page: Page) => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: page }));
  };

  useEffect(() => {
    registerServiceWorker();

    // On load → check supabase session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAdminAuthenticated(true);
        setCurrentPage("admin-dashboard");
        localStorage.setItem("adminAuthenticated", "true");
      } else {
        const saved = localStorage.getItem("adminAuthenticated");
        if (saved === "true") {
          setIsAdminAuthenticated(true);
          setCurrentPage("admin-dashboard");
        }
      }
    };

    checkAuth();

    const handleNavigate = (event: CustomEvent) => {
      navigateToPage(event.detail as Page);
    };

    window.addEventListener("navigate", handleNavigate as EventListener);

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAdminAuthenticated(true);
        setCurrentPage("admin-dashboard");
        localStorage.setItem("adminAuthenticated", "true");

        setTimeout(() => {
          window.history.replaceState({}, "", "/");
        }, 200);
      }

      if (event === "SIGNED_OUT") {
        setIsAdminAuthenticated(false);
        localStorage.removeItem("adminAuthenticated");
        setCurrentPage("admin-login");
      }
    });

    return () => {
      window.removeEventListener("navigate", handleNavigate as EventListener);
    };
  }, []);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem("adminAuthenticated", "true");
    setCurrentPage("admin-dashboard");
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    setCurrentPage("admin-login");
  };

  return (
    <AppProvider>
      {currentPage === "housekeeping" && <Housekeeping onBack={() => navigateToPage("home")} />}

      {currentPage === "restaurant" && <Restaurant onBack={() => navigateToPage("home")} />}

      {currentPage === "travel" && <TravelDesk onBack={() => navigateToPage("home")} />}

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
