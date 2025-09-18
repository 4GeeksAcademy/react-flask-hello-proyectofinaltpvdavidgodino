// src/front/routes.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import Mesas from "./pages/Mesas.jsx";
import AdminCatalog from "./pages/admin/Catalog.jsx";

import { apiGet } from "../api/client";

function RequireAuth({ children }) {
  const t = localStorage.getItem("token");
  if (!t) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const [ok, setOk] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const me = await apiGet("/auth/me");
        if (me?.role === "ADMIN") setOk(true);
        else { setOk(false); nav("/mesas", { replace: true }); }
      } catch {
        setOk(false);
        nav("/login", { replace: true });
      }
    })();
  }, []);

  if (ok === null) return <div style={{ padding: 24 }}>Comprobando permisos…</div>;
  if (ok === false) return null;
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

        <Route
          path="/admin/catalog"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminCatalog />
              </RequireAdmin>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/mesas" replace />} />
      </Routes>
    </BrowserRouter>
  );
}