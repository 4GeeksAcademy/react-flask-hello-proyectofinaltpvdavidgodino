// front/routes.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const BASENAME = import.meta.env.VITE_BASENAME || "/";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        // Públicas
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },

        // Privadas
        {
          path: "tickets",
          element: (
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          ),
        },
        {
          path: "ticket/:id",
          element: (
            <ProtectedRoute>
              <TicketDetail />
            </ProtectedRoute>
          ),
        },

        // Fallback
        { path: "*", element: <Home /> },
      ],
    },
  ],
  { basename: BASENAME }
);