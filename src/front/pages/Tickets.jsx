// src/front/pages/Tickets.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, clearToken } from "../../api/client";

const ESTADOS = [
  { value: "ALL", label: "Todos" },
  { value: "ABIERTO", label: "Abiertos" },
  { value: "CERRADO", label: "Cerrados" },
];

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "";
  }
}

export default function Tickets() {
  const nav = useNavigate();
  const [filtro, setFiltro] = useState("ALL");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const qs = filtro === "ALL" ? "" : `?estado=${filtro}`;
      const data = await apiGet(`/tpv/tickets${qs}`);
      setItems(data);
    } catch (e) {
      alert(e?.error || "No se pudieron cargar los tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filtro]);

  useEffect(() => {
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [filtro]);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => nav("/mesas")}>← Mesas</button>
          <h2 style={{ margin: 0 }}>Tickets</h2>
          <select value={filtro} onChange={e => setFiltro(e.target.value)}>
            {ESTADOS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={load} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
        <button
          onClick={() => { clearToken(); nav("/login", { replace: true }); }}
          style={{ padding: "8px 12px", border: "1px solid #333", borderRadius: 6, background: "#eee", cursor: "pointer" }}
        >
          Salir
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Mesa</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Total (€)</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Estado</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Creado</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "#666" }}>
                  {loading ? "Cargando..." : "No hay tickets para el filtro seleccionado"}
                </td>
              </tr>
            )}
            {items.map(t => (
              <tr key={t.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{t.id}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{t.mesa}</td>
                <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #eee" }}>
                  {Number(t.total).toFixed(2)}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{t.estado}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{fmtDate(t.created_at)}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                  <button onClick={() => nav(`/tickets/${t.id}`)}>Abrir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}