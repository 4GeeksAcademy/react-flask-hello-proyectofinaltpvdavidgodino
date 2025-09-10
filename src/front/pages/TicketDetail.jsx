// src/front/pages/TicketDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPatch } from "../../api/client";

function fmtMoney(n) {
  const x = Number(n || 0);
  return x.toFixed(2);
}

export default function TicketDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [productos, setProductos] = useState([]);

  const [catSel, setCatSel] = useState(null);
  const [subcatSel, setSubcatSel] = useState(null);

  // Numpad / cantidad para el próximo producto
  const [cantidad, setCantidad] = useState(1);

  const total = useMemo(() => {
    return lineas.reduce((acc, l) => acc + Number(l.subtotal || 0), 0);
  }, [lineas]);

  async function loadTicket() {
    setLoading(true);
    try {
      const t = await apiGet(`/tpv/tickets/${id}`);
      setTicket(t);

      const ls = await apiGet(`/tpv/tickets/${id}/lineas`);
      setLineas(ls || []);

      // CATALOGO TPV (categorías + subcategorías + productos)
      const cat = await apiGet(`/tpv/catalogo`);
      const cats = cat?.categorias || [];
      setCategorias(cats);

      // Inicializa selección (permite productos directos sin subcategoría)
      const primera = cats[0] || null;
      if (primera) {
        setCatSel(primera.id);
        setSubcats(primera.subcategorias || []);
        setProductos(primera.productos || []); // <— productos directos de categoría
        setSubcatSel(null);
      } else {
        setCatSel(null);
        setSubcats([]);
        setProductos([]);
        setSubcatSel(null);
      }
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo cargar el ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Cuando cambia la categoría seleccionada, refrescamos subcats/productos
  useEffect(() => {
    if (!catSel) {
      setSubcats([]);
      setProductos([]);
      setSubcatSel(null);
      return;
    }
    const c = categorias.find((c) => c.id === catSel);
    if (!c) return;
    setSubcats(c.subcategorias || []);
    setProductos(c.productos || []); // <— productos directos de categoría
    setSubcatSel(null);
  }, [catSel, categorias]);

  // Cuando cambia la subcategoría, refrescamos productos
  useEffect(() => {
    if (!subcatSel) return;
    const c = categorias.find((c) => c.id === catSel);
    if (!c) return;
    const sc = (c.subcategorias || []).find((s) => s.id === subcatSel);
    if (!sc) return;
    setProductos(sc.productos || []);
  }, [subcatSel, categorias, catSel]);

  // ─────────────────────────────
  // Actions
  // ─────────────────────────────

  async function handleAddProduct(productId) {
    try {
      const resp = await apiPost(`/tpv/tickets/${id}/lineas`, {
        producto_id: productId,
        cantidad: Math.max(1, Number(cantidad || 1)),
      });

      // Backend NUEVO devuelve la LÍNEA creada
      if (resp && resp.id && resp.ticket_id) {
        setLineas((prev) => [...prev, resp]);
      }
      // (Compat) si por algún motivo devuelve el ticket completo con lineas
      else if (resp && resp.lineas) {
        setLineas(resp.lineas || []);
      }

      setCantidad(1);
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo agregar el producto");
    }
  }

  async function handleDelLinea(lineaId) {
    try {
      await apiPatch(`/tpv/tickets/${id}/lineas/${lineaId}`, {
        accion: "ELIMINAR",
      });
      setLineas((prev) => prev.filter((l) => l.id !== lineaId));
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo eliminar la línea");
    }
  }

  async function handleCerrarTicket() {
    if (!window.confirm("¿Cerrar el ticket?")) return;
    try {
      await apiPatch(`/tpv/tickets/${id}`, { accion: "CERRAR" });
      nav("/mesas", { replace: true, state: { refresh: true } });
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo cerrar el ticket");
    }
  }

  function handleVolver() {
    nav("/mesas", { replace: true, state: { refresh: true } });
  }

  // Numpad handlers
  function pressNum(n) {
    const prev = String(cantidad || "");
    const next = Number((prev === "0" ? String(n) : prev + String(n)) || "0");
    setCantidad(next > 999 ? 999 : next);
  }
  function pressClr() {
    setCantidad(1);
  }
  function pressBk() {
    const s = String(cantidad);
    const trimmed = s.length <= 1 ? "1" : s.slice(0, -1);
    setCantidad(Number(trimmed));
  }

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={handleVolver}>← Mesas</button>
          <h2 style={{ margin: 0 }}>
            Ticket #{id} {ticket?.mesa ? `· Mesa ${ticket.mesa}` : ""}
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Total: {fmtMoney(total)} €</div>
          <button onClick={handleCerrarTicket} style={{ background: "#222", color: "white", padding: "8px 12px", borderRadius: 6 }}>
            Cerrar ticket
          </button>
        </div>
      </div>

      {loading && <div style={{ marginBottom: 8 }}>Cargando…</div>}

      {/* 3 columnas: numpad / categorías / líneas */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 380px", gap: 12 }}>
        {/* Columna 1: Numpad + cantidad */}
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Cantidad</div>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "12px 8px",
              fontSize: 24,
              textAlign: "right",
              marginBottom: 12,
            }}
          >
            {cantidad}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} onClick={() => pressNum(n)} style={{ padding: "12px 0" }}>
                {n}
              </button>
            ))}
            <button onClick={pressBk}>←</button>
            <button onClick={() => pressNum(0)}>0</button>
            <button onClick={pressClr}>CLR</button>
          </div>
        </div>

        {/* Columna 2: Categorías / Subcategorías / Productos */}
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          {/* Categorías */}
          <div style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => setCatSel(c.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #aaa",
                  background: c.id === catSel ? "#e6f0ff" : "#f7f7f7",
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>

          {/* Subcategorías (si las hay) */}
          {subcats?.length > 0 && (
            <div style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {subcats.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubcatSel(s.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: s.id === subcatSel ? "#e6f0ff" : "#fff",
                  }}
                >
                  {s.nombre}
                </button>
              ))}
              {subcatSel && (
                <button
                  onClick={() => {
                    // volver a ver productos de la categoría
                    setSubcatSel(null);
                    const c = categorias.find((x) => x.id === catSel);
                    setProductos(c?.productos || []);
                  }}
                  style={{ padding: "6px 10px", borderRadius: 6 }}
                >
                  Ver productos de categoría
                </button>
              )}
            </div>
          )}

          {/* Productos */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 8,
              alignContent: "start",
            }}
          >
            {productos?.length === 0 && (
              <div style={{ color: "#777" }}>No hay productos para esta selección</div>
            )}
            {productos?.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddProduct(p.id)}
                style={{
                  height: 64,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  background: "#fafafa",
                  padding: 8,
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                <div style={{ fontSize: 13 }}>{fmtMoney(p.precio)} €</div>
              </button>
            ))}
          </div>
        </div>

        {/* Columna 3: Líneas del ticket */}
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Líneas</div>
          <div style={{ maxHeight: 440, overflowY: "auto" }}>
            {lineas.length === 0 && <div style={{ color: "#777" }}>No hay líneas</div>}
            {lineas.map((l) => (
              <div
                key={l.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 70px 70px 28px",
                  gap: 8,
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                  padding: "8px 0",
                }}
              >
                <div>{l.nombre || `#${l.producto_id}`}</div>
                <div style={{ textAlign: "right" }}>x{l.cantidad}</div>
                <div style={{ textAlign: "right" }}>{fmtMoney(l.subtotal)} €</div>
                <button
                  onClick={() => handleDelLinea(l.id)}
                  title="Eliminar línea"
                  style={{ border: "1px solid #ddd", borderRadius: 6 }}
                >
                  ⓧ
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
            <div>Total</div>
            <div>{fmtMoney(total)} €</div>
          </div>
        </div>
      </div>
    </div>
  );
}