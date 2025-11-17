import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";
import React from "react";

export default function RequireAuth({ children }) {
  const session = useContext(AuthContext);

  // still loading session → avoid blank screen
  if (session === null) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
