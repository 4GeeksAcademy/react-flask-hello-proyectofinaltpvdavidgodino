import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet, setToken, clearToken, getToken } from "../api/client";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { id, email, nombre, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // si hay token, intenta recuperar /auth/me
    const t = getToken();
    if (!t) return setLoading(false);
    apiGet("/auth/me")
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const resp = await (await fetch(`${window.location.origin.includes("-3000") ? window.location.origin.replace("-3000","-5000") : "http://localhost:5000"}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })).json();

    if (resp?.access_token) {
      setToken(resp.access_token);
      setUser(resp.user);
      return resp.user;
    }
    throw new Error(resp?.error || "Login inválido");
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}