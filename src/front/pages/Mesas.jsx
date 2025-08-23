// src/front/pages/Mesas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";

export default function Mesas() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  // Cargar tickets existentes
  useEffect(() => {
    apiGet("/tpv/tickets?estado=ABIERTO")
      .then(setTickets)
      .catch(err => console.error("Error cargando tickets", err));
  }, []);

  // Buscar si una mesa ya tiene ticket abierto
  const getTicketForMesa = (mesa) => {
    return tickets.find(t => t.mesa === mesa && t.estado === "ABIERTO");
  };

  const handleMesaClick = async (mesa) => {
    const existente = getTicketForMesa(mesa);
    if (existente) {
      navigate(`/tickets/${existente.id}`);
    } else {
      try {
        const nuevo = await apiPost("/tpv/tickets", { mesa });
        navigate(`/tickets/${nuevo.id}`);
      } catch (e) {
        alert("No se pudo crear el ticket");
      }
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Mesas</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "12px",
        marginTop: 20
      }}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map(mesa => (
          <button
            key={mesa}
            onClick={() => handleMesaClick(mesa)}
            style={{
              padding: "24px",
              fontSize: "18px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: getTicketForMesa(mesa) ? "#ffecb3" : "#e0f7fa",
              cursor: "pointer"
            }}
          >
            Mesa {mesa}
          </button>
        ))}
      </div>
    </div>
  );
}