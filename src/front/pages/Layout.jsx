import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <nav style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
        <Link to="/tickets">Tickets</Link>
      </nav>

      {/* IMPORTANTE!!!! Renderiza las rutas hijas */}
      <div style={{ padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
