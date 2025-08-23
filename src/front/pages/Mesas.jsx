// src/front/pages/Mesas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>Mesas</h2>
        <button
          onClick={() => navigate("/tickets")}
          style={{
            padding: "8px 12px",
            fontSize: 14,
            background: "#eee",
            border: "1px solid #333",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Tickets abiertos ({abiertasCount})
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
                padding: "20px",
                fontSize: "16px",
                background: ticket ? "#999" : "#eee",
                border: "1px solid #333",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div>Mesa {mesa}</div>
              {ticket && (
                <div style={{ fontSize: "14px", marginTop: 6 }}>
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