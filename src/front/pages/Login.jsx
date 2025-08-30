// src/front/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../api/client";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("admin@easytpv.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setToken, setRole } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data  = await apiPost("/auth/login", { email, password });
      const token = data?.access_token;
      const role  = data?.role;

      if (!token || !role) {
        setError("URL is not valid or contains user credentials.");
        return;
      }

      setToken(token);
      setRole(role);

      // (Opcional) podrías redirigir distinto por rol.
      navigate("/mesas", { replace: true });
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