import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { InstallPrompt } from './components/InstallPrompt';
import { BackToTop } from './components/BackToTop';
import { registerServiceWorker } from './utils/pwa';
import Housekeeping from './pages/Housekeeping';
import Restaurant from './pages/Restaurant';
import TravelDesk from './pages/TravelDesk';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { supabase } from './services/api';
import React from 'react';

type Page =
  | 'home'
  | 'housekeeping'
  | 'restaurant'
  | 'travel'
  | 'admin-login'
  | 'admin-dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // global navigation helper
  (window as any).navigateToPage = (page: Page) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
  };

  useEffect(() => {
    registerServiceWorker();

    // ----------------------------------------
    // ⭐ FIX 1: Handle Google OAuth Redirect
    // ----------------------------------------
    if (
      window.location.pathname === "/dashboard" &&
      window.location.hash.includes("access_token")
    ) {
      setIsAdminAuthenticated(true);
      setCurrentPage("admin-dashboard");

      // clean URL after login
      setTimeout(() => {
        window.history.replaceState({}, "", "/");
      }, 200);
    }

    // custom navigation event
    const handleNavigate = (event: CustomEvent) => {
      const page = event.detail as Page;
      navigateToPage(page);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);

    // ----------------------------------------
    // ⭐ FIX 2: Load session on first app mount
    // ----------------------------------------
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setIsAdminAuthenticated(true);
          setCurrentPage('admin-dashboard');
          localStorage.setItem('adminAuthenticated', 'true');
        } else {
          // restore login state if present
          const adminAuth = localStorage.getItem('adminAuthenticated');
          if (adminAuth === 'true') {
            setIsAdminAuthenticated(true);
            setCurrentPage('admin-dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();

    // ----------------------------------------
    // ⭐ FIX 3: Auth state listener
    // ----------------------------------------
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAdminAuthenticated(true);
        setCurrentPage('admin-dashboard');
        localStorage.setItem('adminAuthenticated', 'true');

        // clean URL
        setTimeout(() => {
          window.history.replaceState({}, "", "/");
        }, 200);
      }

      if (event === 'SIGNED_OUT') {
        setIsAdminAuthenticated(false);
        setCurrentPage('admin-login');
        localStorage.removeItem('adminAuthenticated');
        window.history.replaceState({}, '', '/admin-login');
      }
    });

    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  // manual email login
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('adminAuthenticated', 'true');
    setCurrentPage('admin-dashboard');

    window.history.pushState({}, '', '/dashboard');
    setTimeout(() => {
      window.history.replaceState({}, '', '/');
    }, 200);
  };

  // logout
  const handleAdminLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAdminAuthenticated(false);
      localStorage.removeItem('adminAuthenticated');
      setCurrentPage('admin-login');
      window.history.replaceState({}, '', '/admin-login');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsAdminAuthenticated(false);
      localStorage.removeItem('adminAuthenticated');
    }
  };

  return (
    <AppProvider>
      {/* Housekeeping */}
      {currentPage === 'housekeeping' && (
        <>
          <Housekeeping onBack={() => navigateToPage('home')} />
          <Toaster position="top-right" richColors />
        </>
      )}

      {/* Restaurant */}
      {currentPage === 'restaurant' && (
        <>
          <Restaurant onBack={() => navigateToPage('home')} />
          <Toaster position="top-right" richColors />
        </>
      )}

      {/* Travel */}
      {currentPage === 'travel' && (
        <>
          <TravelDesk onBack={() => navigateToPage('home')} />
          <Toaster position="top-right" richColors />
        </>
      )}

      {/* Admin Login */}
      {currentPage === 'admin-login' && (
        <>
          <AdminLogin onLoginSuccess={handleAdminLogin} />
          <Toaster position="top-right" richColors />
        </>
      )}

      {/* Admin Dashboard */}
      {currentPage === 'admin-dashboard' && isAdminAuthenticated && (
        <>
          <AdminDashboard onLogout={handleAdminLogout} />
          <Toaster position="top-right" richColors />
        </>
      )}

      {/* Homepage */}
      {currentPage === 'home' && (
        <div className="min-h-screen">
          <Navbar />
          <Hero />
          <Services onNavigate={navigateToPage} />
          <Features />
          <Footer />
          <InstallPrompt />
          <BackToTop />
          <Toaster position="top-right" richColors />
        </div>
      )}
    </AppProvider>
  );
}
