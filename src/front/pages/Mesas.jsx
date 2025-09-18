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

  const mesas = useMemo(
    () => Array.from({ length: NUM_MESAS }, (_, i) => i + 1),
    []
  );

  async function loadTicketsAbiertos() {
    setLoading(true);
    try {
      const items = await apiGet("/tpv/tickets?estado=ABIERTO"); // ← espera array
      const map = {};
      for (const t of items || []) {
        const m = String(t.mesa);
        if (!map[m])
          map[m] = {
            id: t.id,
            estado: t.estado,
            total: Number(t.total || 0),
          };
      }
      setByMesa(map);
    } catch (e) {
      console.error("ERROR /tpv/tickets?estado=ABIERTO ⇒", e);
      alert(e.message || "No se pudieron cargar las mesas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicketsAbiertos();
  }, []);

  // Vuelta desde TicketDetail con refresh
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
        // existe abierto
        nav(`/tickets/${info.id}`);
        return;
      }
      // crear
      const created = await apiPost("/tpv/tickets", { mesa: mesaNum });
      nav(`/tickets/${created.id}`);
    } catch (e) {
      console.error("ERROR abrir/crear ticket ⇒", e);
      alert(e.message || "No se pudo abrir/crear ticket");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Mesas</h2>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              nav("/login", { replace: true });
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #333",
              borderRadius: 6,
              background: "#f2f2f2",
            }}
          >
            Salir
          </button>

          <button
            onClick={() => nav("/admin/catalog")}
            style={{
              padding: "8px 12px",
              border: "1px solid #333",
              borderRadius: 6,
              background: "#eee",
            }}
          >
            Catálogo
          </button>

          <button
            onClick={() => nav("/tickets")}
            style={{
              padding: "8px 12px",
              border: "1px solid #333",
              borderRadius: 6,
              background: "#eee",
            }}
          >
            Tickets
          </button>
        </div>
      </div>

      {loading && <div style={{ marginBottom: 8 }}>Cargando…</div>}

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