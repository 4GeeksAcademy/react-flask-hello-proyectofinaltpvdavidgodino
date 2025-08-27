// src/front/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem("token") || "");

  const setToken = (t) => {
    setTokenState(t || "");
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const value = useMemo(() => ({ token, setToken }), [token]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setTokenState(e.newValue || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}