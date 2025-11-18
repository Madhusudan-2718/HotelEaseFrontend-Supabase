import { useEffect } from "react";
import { supabase } from "../../services/api";
import React from "react";


export default function AuthCallback() {
  useEffect(() => {
    async function verifyLogin() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // Successfully logged in → redirect to dashboard
        window.location.href = "/admin/dashboard";
      } else {
        // Failed login → go back to login page
        window.location.href = "/admin/login";
      }
    }

    verifyLogin();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-white text-lg">
      Processing login…
    </div>
  );
}
