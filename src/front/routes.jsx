import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import Mesas from "./pages/Mesas.jsx";

import { getToken } from "../api/client";

function RequireAuth({ children }) {
  const t = getToken();
  if (!t) return <Navigate to="/login" replace />;
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

        <Route path="*" element={<Navigate to="/mesas" replace />} />
      </Routes>
    </BrowserRouter>
  );
}