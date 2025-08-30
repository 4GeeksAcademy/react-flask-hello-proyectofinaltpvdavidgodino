// src/front/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem("token") || "");
  const [role,  setRoleState]  = useState(() => localStorage.getItem("role")  || ""); // ← NUEVO

  const setToken = (t) => {
    setTokenState(t || "");
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const setRole = (r) => {                  // ← NUEVO
    setRoleState(r || "");
    if (r) localStorage.setItem("role", r);
    else localStorage.removeItem("role");
  };

  // sync entre pestañas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setTokenState(e.newValue || "");
      if (e.key === "role")  setRoleState(e.newValue || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ token, role, setToken, setRole }), [token, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}