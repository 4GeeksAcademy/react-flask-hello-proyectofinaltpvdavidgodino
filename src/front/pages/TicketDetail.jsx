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
  const [loading, setLoading] = useState(false);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await apiGet(`/tpv/tickets/${id}`);
      setT(data);
    } catch (e) {
      setError(e?.error || "Error cargando ticket");
    } finally {
      setLoading(false);
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
      await load();
    } catch (e) {
      alert(e?.error || "No se pudo añadir");
    }
  }

  async function cerrar() {
    try {
      await apiPost(`/tpv/tickets/${id}/cerrar`);
      // al cerrar -> volver a Mesas refrescando
      nav("/mesas", { replace: true, state: { refresh: true } });
    } catch (e) {
      alert(e?.error || "No se pudo cerrar");
    }
  }

  function volver() {
    // volver a Mesas y refrescar
    nav("/mesas", { replace: true, state: { refresh: true } });
  }

  if (!t) return <div style={{ padding: 24, fontFamily: "sans-serif" }}>Cargando…</div>;

  const editable = t.estado === "ABIERTO";

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button onClick={volver}>← Volver</button>
        <h2 style={{ margin: 0 }}>
          Ticket #{t.id} — mesa {t.mesa} — {t.estado}
        </h2>
      </div>

      <div style={{ margin: "12px 0", padding: 12, border: "1px solid #ddd" }}>
        <strong>Añadir línea</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Producto"
            value={form.producto}
            onChange={(e) => setForm({ ...form, producto: e.target.value })}
            disabled={!editable}
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            disabled={!editable}
            style={{ width: 100 }}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={form.precio_unitario}
            onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })}
            disabled={!editable}
            style={{ width: 120 }}
          />
          <button onClick={addLinea} disabled={!editable}>
            Añadir
          </button>
        </div>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}

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
          {(t.lineas || []).map((l) => (
            <tr key={l.id}>
              <td style={{ padding: "6px 4px" }}>{l.producto_nombre || l.producto}</td>
              <td style={{ textAlign: "right", padding: "6px 4px" }}>{l.cantidad}</td>
              <td style={{ textAlign: "right", padding: "6px 4px" }}>{Number(l.precio_unitario).toFixed(2)} €</td>
              <td style={{ textAlign: "right", padding: "6px 4px" }}>{Number(l.subtotal).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: "right", paddingTop: 8 }}>
              <strong>Total</strong>
            </td>
            <td style={{ textAlign: "right", paddingTop: 8 }}>
              <strong>{Number(t.total).toFixed(2)} €</strong>
            </td>
          </tr>
        </tfoot>
      </table>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={volver}>Volver</button>
        <button onClick={cerrar} disabled={!editable}>Cerrar ticket</button>
      </div>
    </div>
  );
}