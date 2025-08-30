// src/front/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ children, allowRoles }) {
  const { token, role } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname }} />;
  }

  if (allowRoles && !allowRoles.includes(role)) {
    // autenticado pero sin permisos -> manda a Mesas
    return <Navigate to="/mesas" replace />;
  }

  return children;
}