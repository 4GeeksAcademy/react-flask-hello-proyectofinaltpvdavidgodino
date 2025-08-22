// front/routes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import Demo from "./pages/Demo.jsx";
import Single from "./pages/Single.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

const BASENAME = import.meta.env.VITE_BASENAME || "/";

export default function AppRoutes() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        {/* Shell común (navbar/footer) */}
        <Route element={<Layout />}>
          {/* Públicas */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="demo" element={<Demo />} />
          <Route path="single/:theid" element={<Single />} />

          {/* Privadas (requieren token) */}
          <Route
            path="tickets"
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="ticket/:id"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}