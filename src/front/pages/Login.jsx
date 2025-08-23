// src/front/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiGet, setToken } from "../../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@easytpv.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await apiPost("/auth/login", { email, password });
      console.log("[login] resp =", resp);
      if (!resp?.access_token) {
        throw { error: "Login OK sin token (respuesta inesperada)" };
      }
      setToken(resp.access_token);

      // ✅ Verifica inmediatamente que el backend te reconoce
      const me = await apiGet("/auth/me");
      console.log("[login] /auth/me =", me);

      navigate("/tickets");
    } catch (err) {
      console.warn("[login] error =", err);
      setError(err?.error || err?.message || "Las credenciales no son válidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "64px auto", fontFamily: "sans-serif" }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          type="email" value={email} required autoFocus
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <label>Contraseña</label>
        <input
          type="password" value={password} required
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
