import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [mesa, setMesa] = useState(1);
  const [estado, setEstado] = useState(""); // "", "ABIERTO", "CERRADO"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const qs = estado ? `?estado=${estado}` : "";
      const data = await apiGet(`/tpv/tickets${qs}`);
      setTickets(data);
    } catch (e) {
      setError(e?.error || e?.message || "No se pudieron cargar los tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [estado]);

  async function crearTicket(e) {
    e?.preventDefault();
    setCreating(true);
    setError("");
    try {
      await apiPost("/tpv/tickets", { mesa: Number(mesa) });
      setMesa(1);
      await load();
    } catch (e) {
      setError(e?.error || e?.message || "No se pudo crear el ticket");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Tickets</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>Filtrar por estado:</label>
        <select value={estado} onChange={e=>setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="ABIERTO">Abiertos</option>
          <option value="CERRADO">Cerrados</option>
        </select>

        <form onSubmit={crearTicket} style={{ display: "inline-flex", gap: 8, alignItems: "center", marginLeft: 24 }}>
          <label>Mesa:</label>
          <input
            type="number"
            min={1}
            value={mesa}
            onChange={e=>setMesa(e.target.value)}
            style={{ width: 80 }}
          />
          <button type="submit" disabled={creating}>
            {creating ? "Creando..." : "Crear ticket"}
          </button>
        </form>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>Cargando…</div>
      ) : tickets.length === 0 ? (
        <div>No hay tickets</div>
      ) : (
        <ul style={{ lineHeight: "1.9" }}>
          {tickets.map(t => (
            <li key={t.id}>
              <strong>#{t.id}</strong> — mesa {t.mesa} — {t.estado} — total {Number(t.total).toFixed(2)} €
              {" · "}
              <Link to={`/ticket/${t.id}`}>abrir</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}