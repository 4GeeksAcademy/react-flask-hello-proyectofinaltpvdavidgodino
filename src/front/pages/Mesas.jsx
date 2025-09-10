// src/front/pages/Mesas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";

const NUM_MESAS = 30;

export default function Mesas() {
  const nav = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [byMesa, setByMesa] = useState({}); // { [mesa]: { id, estado, total } }
  const [isAdmin, setIsAdmin] = useState(false);
  const mesas = useMemo(() => Array.from({ length: NUM_MESAS }, (_, i) => i + 1), []);

  async function loadTicketsAbiertos() {
    setLoading(true);
    try {
      const items = await apiGet(`/tpv/tickets?estado=ABIERTO`);
      const map = {};
      for (const t of items || []) {
        const m = String(t.mesa);
        if (!map[m]) map[m] = { id: t.id, estado: t.estado, total: Number(t.total || 0) };
      }
      setByMesa(map);
    } catch (e) {
      console.error(e);
      alert(e?.message || e?.error || "No se pudieron cargar las mesas");
    } finally {
      setLoading(false);
    }
  }

  async function loadRole() {
    try {
      const me = await apiGet(`/auth/me`);
      setIsAdmin(me?.role === "ADMIN");
    } catch {
      setIsAdmin(false);
    }
  }

  // Carga inicial
  useEffect(() => { loadTicketsAbiertos(); loadRole(); }, []);

  // Si volvemos desde TicketDetail con {state:{refresh:true}} -> recargar y limpiar state
  useEffect(() => {
    if (location.state?.refresh) {
      loadTicketsAbiertos();
      nav(".", { replace: true, state: {} });
    }
  }, [location.state?.refresh]);

  async function handleMesaClick(mesaNum) {
    const info = byMesa[String(mesaNum)];
    try {
      if (info && info.estado === "ABIERTO") {
        nav(`/tickets/${info.id}`);
      } else {
        const created = await apiPost(`/tpv/tickets`, { mesa: mesaNum });
        nav(`/tickets/${created.id}`);
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || e?.error || "No se pudo abrir/crear ticket");
    }
  }

  function handleSalir() {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Mesas</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav("/tickets")}>Tickets</button>
          {isAdmin && (
            <button onClick={() => nav("/admin/catalog")}>
              Catálogo
            </button>
          )}
          <button onClick={handleSalir}>Salir</button>
        </div>
      </div>

      {loading && <div style={{ marginBottom: 8 }}>Cargando…</div>}

      {/* grid 3 x 10 como antes, pero responsivo */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, minmax(110px, 1fr))",
          gap: 12,
        }}
      >
        {mesas.map((n) => {
          const m = byMesa[String(n)];
          const abierta = m && m.estado === "ABIERTO";
          return (
            <button
              key={n}
              onClick={() => handleMesaClick(n)}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: 90,
                borderRadius: 8,
                border: "1px solid #ccc",
                background: abierta ? "#e6f0ff" : "#f7f7f7",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600 }}>Mesa {n}</div>
              {abierta && (
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  {Number(m.total || 0).toFixed(2)} €
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}