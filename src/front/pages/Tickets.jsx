// src/pages/Tickets.jsx
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";

export default function Tickets() {
  const [items, setItems] = useState([]);
  const [mesa, setMesa] = useState(1);
  const [estado, setEstado] = useState("ABIERTO");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const qs = estado ? `?estado=${estado}` : "";
      const data = await apiGet(`/tpv/tickets${qs}`);
      setItems(data);
    } catch (e) {
      setError(e.error || "Error cargando tickets");
    }
  };

  useEffect(() => { load(); }, [estado]);

  const crear = async () => {
    try {
      await apiPost("/tpv/tickets", { mesa: Number(mesa) });
      setMesa(1);
      load();
    } catch (e) {
      alert(e.error || "No se pudo crear");
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Tickets</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>Filtrar:</label>
        <select value={estado} onChange={e=>setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="ABIERTO">Abiertos</option>
          <option value="CERRADO">Cerrados</option>
        </select>
        <span style={{ marginLeft: 16 }}>Nueva mesa:</span>
        <input type="number" value={mesa} onChange={e=>setMesa(e.target.value)} style={{ width: 80 }} />
        <button onClick={crear}>Crear ticket</button>
      </div>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

      <ul style={{ marginTop: 16 }}>
        {items.map(t => (
          <li key={t.id}>
            #{t.id} — mesa {t.mesa} — {t.estado} — total {t.total?.toFixed?.(2) ?? t.total} €
            {" "}
            <a href={`/ticket/${t.id}`} style={{ marginLeft: 8 }}>abrir</a>
          </li>
        ))}
      </ul>
    </div>
  );
}