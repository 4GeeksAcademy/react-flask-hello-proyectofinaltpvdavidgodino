// src/front/routes.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Mesas from "./pages/Mesas.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// 👇 importa el admin
import AdminCatalog from "./pages/admin/Catalog.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/mesas" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/mesas"
          element={
            <ProtectedRoute>
              <Mesas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetail />
            </ProtectedRoute>
          }
        />

        {/* Solo ADMIN */}
        <Route
          path="/admin/catalog"
          element={
            <ProtectedRoute allowRoles={["ADMIN"]}>
              <AdminCatalog />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/mesas" replace />} />
      </Routes>
    </BrowserRouter>
  );
}