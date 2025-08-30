// src/front/routes.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import Mesas from "./pages/Mesas.jsx";
import AdminCatalog from "./pages/admin/Catalog.jsx";

import { useAuth } from "./AuthContext";

function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/mesas" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/mesas" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/mesas"
          element={
            <RequireAuth>
              <Mesas />
            </RequireAuth>
          }
        />
        <Route
          path="/tickets"
          element={
            <RequireAuth>
              <Tickets />
            </RequireAuth>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <RequireAuth>
              <TicketDetail />
            </RequireAuth>
          }
        />

        {/* ADMIN ONLY */}
        <Route
          path="/admin/catalog"
          element={
            <RequireAdmin>
              <AdminCatalog />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/mesas" replace />} />
      </Routes>
    </BrowserRouter>
  );
}