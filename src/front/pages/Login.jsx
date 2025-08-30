// src/front/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiPost, apiGet } from "../../api/client";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("admin@easytpv.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { setToken, setRole } = useAuth(); // ← role
  const returnTo = location.state?.returnTo || "/mesas";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiPost("/auth/login", { email, password });
      const token = data?.access_token;
      if (!token) {
        setError("Usuario incorrecto");
        return;
      }

      setToken(token);

      // pide info al backend para conocer el rol
      const who = await apiGet("/auth/check");
      setRole(who?.user?.role || "");  // p.ej. "ADMIN"

      navigate(returnTo, { replace: true });
    } catch {
      setError("Usuario incorrecto");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "32px auto" }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <label>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{ color: "#b00020", marginTop: 8 }}>{error}</div>}
        <button type="submit" style={{ marginTop: 12 }}>Entrar</button>
      </form>
    </div>
  );
}