import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, setToken } from "../../src/api/client"; // usa tu client.js

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
      // resp = { access_token, role, user }
      setToken(resp.access_token);
      navigate("/tickets");
    } catch (err) {
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
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
          autoFocus
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
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