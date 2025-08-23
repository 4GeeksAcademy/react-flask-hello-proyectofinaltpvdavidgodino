// src/front/pages/Mesas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, clearToken } from "../../api/client";

export default function Mesas() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  const loadTickets = async () => {
    try {
      const data = await apiGet("/tpv/tickets?estado=ABIERTO");
      setTickets(data);
    } catch (err) {
      console.error("Error cargando tickets", err);
    }
  };

  useEffect(() => {
    loadTickets();
    const id = setInterval(loadTickets, 5000);
    return () => clearInterval(id);
  }, []);

  const crearOTraerTicket = async (mesa) => {
    const existente = tickets.find(
      (t) => Number(t.mesa) === Number(mesa) && t.estado === "ABIERTO"
    );
    if (existente) {
      navigate(`/tickets/${existente.id}`);
      return;
    }
    try {
      const nuevo = await apiPost("/tpv/tickets", { mesa });
      navigate(`/tickets/${nuevo.id}`);
    } catch (err) {
      alert(err.error || "No se pudo abrir/crear el ticket");
    }
  };

  const abiertasCount = tickets.length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Mesas</h2>
          <button
            onClick={() => navigate("/tickets")}
            style={{ padding: "8px 12px", border: "1px solid #333", borderRadius: 6, background: "#eee", cursor: "pointer" }}
          >
            Tickets abiertos ({abiertasCount})
          </button>
        </div>
        <button
          onClick={() => { clearToken(); navigate("/login", { replace: true }); }}
          style={{ padding: "8px 12px", border: "1px solid #333", borderRadius: 6, background: "#eee", cursor: "pointer" }}
        >
          Salir
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 12 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const mesa = i + 1;
          const ticket = tickets.find(
            (t) => Number(t.mesa) === Number(mesa) && t.estado === "ABIERTO"
          );
          return (
            <button
              key={mesa}
              onClick={() => crearOTraerTicket(mesa)}
              style={{
                padding: 20,
                fontSize: 16,
                background: ticket ? "#ddd" : "#eee",
                border: "1px solid #333",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <div>Mesa {mesa}</div>
              {ticket && (
                <div style={{ fontSize: 14, marginTop: 6 }}>
                  {Number(ticket.total).toFixed(2)} €
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}