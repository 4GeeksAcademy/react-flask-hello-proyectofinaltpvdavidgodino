import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@easytpv.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      nav("/tickets");
    } catch (err) {
      setError(err.message || "Las credenciales no son válidas");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "64px auto", fontFamily: "sans-serif" }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{ width: "100%", marginBottom: 8 }} />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{ width: "100%", marginBottom: 8 }} />
        {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}