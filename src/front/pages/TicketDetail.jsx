// src/front/pages/TicketDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";

export default function TicketDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [t, setT] = useState(null);
  const [form, setForm] = useState({ producto: "Caña", cantidad: 1, precio_unitario: 2.2 });
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const data = await apiGet(`/tpv/tickets/${id}`);
      setT(data);
    } catch (e) {
      setError(e?.error || e?.message || "Error cargando ticket");
    }
  }

  useEffect(() => { load(); }, [id]);

  async function addLinea() {
    try {
      await apiPost(`/tpv/tickets/${id}/lineas`, {
        producto: form.producto,
        cantidad: Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario),
      });
      setForm({ producto: "Caña", cantidad: 1, precio_unitario: 2.2 });
      load();
    } catch (e) {
      alert(e?.error || e?.message || "No se pudo añadir");
    }
  }

  async function cerrar() {
    try {
      await apiPost(`/tpv/tickets/${id}/cerrar`);
      load();
    } catch (e) {
      alert(e?.error || e?.message || "No se pudo cerrar");
    }
  }

  if (!t) return <div style={{ padding: 24 }}>Cargando…</div>;

  const editable = t.estado === "ABIERTO";

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <button onClick={() => nav("/tickets")}>← Volver</button>
      <h2>Ticket #{t.id} — mesa {t.mesa} — {t.estado}</h2>

      <div style={{ margin: "12px 0", padding: 12, border: "1px solid #ddd" }}>
        <strong>Añadir línea</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            value={form.producto}
            onChange={e => setForm({ ...form, producto: e.target.value })}
            placeholder="Producto"
          />
          <input
            type="number"
            min={1}
            value={form.cantidad}
            onChange={e => setForm({ ...form, cantidad: e.target.value })}
            style={{ width: 80 }}
          />
          <input
            type="number"
            step="0.01"
            min={0}
            value={form.precio_unitario}
            onChange={e => setForm({ ...form, precio_unitario: e.target.value })}
            style={{ width: 100 }}
          />
          <button onClick={addLinea} disabled={!editable}>Añadir</button>
        </div>
      </div>

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Producto</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Cantidad</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>P. Unit</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(t.lineas || []).map(l => (
            <tr key={l.id}>
              <td>{l.producto}</td>
              <td style={{ textAlign: "right" }}>{l.cantidad}</td>
              <td style={{ textAlign: "right" }}>{Number(l.precio_unitario).toFixed(2)} €</td>
              <td style={{ textAlign: "right" }}>{Number(l.subtotal).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: "right", paddingTop: 8 }}><strong>Total</strong></td>
            <td style={{ textAlign: "right", paddingTop: 8 }}><strong>{Number(t.total).toFixed(2)} €</strong></td>
          </tr>
        </tfoot>
      </table>

      <div style={{ marginTop: 12 }}>
        <button onClick={cerrar} disabled={!editable}>Cerrar ticket</button>
      </div>
    </div>
  );
}