import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";
import NumPad from "../components/NumPad";

export default function TicketDetail() {
  const nav = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  // catálogo
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  // selección / cantidad
  const [selCat, setSelCat] = useState(null);
  const [selSub, setSelSub] = useState(null);
  const [qty, setQty] = useState(1);

  const subtotal = useMemo(() => {
    const lines = ticket?.lineas || [];
    return lines.reduce((acc, l) => acc + Number(l.precio_unitario || 0) * Number(l.cantidad || 0), 0);
  }, [ticket]);

  // ─────────────────── carga ticket + catálogo ───────────────────
  async function loadTicket() {
    try {
      setLoading(true);
      const data = await apiGet(`/tpv/tickets/${id}`);
      setTicket(data);
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo cargar el ticket");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategorias() {
    try {
      // Si no existe todavía el endpoint, esto lanzará error y caerá en catch, pero la UI sigue
      const data = await apiGet(`/admin/catalogo/categorias`);
      setCategorias(data || []);
    } catch {
      setCategorias([]); // catálogo vacío (placeholder)
    }
  }

  async function loadSubcategorias(categoriaId) {
    setSubcategorias([]);
    setProductos([]);
    setSelSub(null);
    try {
      const data = await apiGet(`/admin/catalogo/subcategorias?categoria_id=${categoriaId}`);
      setSubcategorias(data || []);
    } catch {
      setSubcategorias([]);
    }
  }

  async function loadProductos(subcategoriaId) {
    setProductos([]);
    try {
      const data = await apiGet(`/admin/catalogo/productos?subcategoria_id=${subcategoriaId}`);
      setProductos(data || []);
    } catch {
      setProductos([]);
    }
  }

  useEffect(() => { loadTicket(); }, [id]);
  useEffect(() => { loadCategorias(); }, []);

  // ─────────────────── acciones ───────────────────
  const onSelectCategoria = (cat) => {
    setSelCat(cat);
    loadSubcategorias(cat.id);
  };

  const onSelectSubcategoria = (sub) => {
    setSelSub(sub);
    loadProductos(sub.id);
  };

  const addProducto = async (prod) => {
    try {
      await apiPost(`/tpv/tickets/${id}/lineas`, { producto_id: prod.id, cantidad: qty });
      setQty(1);
      await loadTicket();
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo añadir el producto");
    }
  };

  const cerrarTicket = async () => {
    try {
      await apiPost(`/tpv/tickets/${id}/cerrar`, {});
      nav("/mesas", { replace: true, state: { refresh: true } });
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo cerrar el ticket");
    }
  };

  const volverMesas = () => {
    nav("/mesas", { replace: true, state: { refresh: true } });
  };

  // ─────────────────── UI ───────────────────
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      {/* Barra superior */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={volverMesas} style={btnSecondary}>← Mesas</button>
          <h2 style={{ margin: 0 }}>Ticket #{id}</h2>
          {ticket?.mesa && <span style={{ color: "#666" }}>Mesa {ticket.mesa}</span>}
          {loading && <span style={{ marginLeft: 8, color: "#666" }}>Cargando…</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontWeight: 600 }}>Subtotal: {subtotal.toFixed(2)} €</div>
          <button onClick={loadTicket} style={btnSecondary}>⟳ Refrescar</button>
          <button onClick={cerrarTicket} style={btnDanger}>Cerrar ticket</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Columna izquierda: Qty + catálogo */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
          {/* Teclado cantidad */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Cantidad</div>
            <NumPad value={qty} onChange={setQty} onAdd={() => { /* noop, se usa al pulsar producto */ }} />
            <div style={{ marginTop: 8, color: "#666" }}>Toca un producto para añadir con la cantidad indicada.</div>
          </div>

          {/* Catálogo */}
          <div>
            <div style={{ marginBottom: 6, fontWeight: 600 }}>Categorías</div>
            <div style={gridWrap}>
              {categorias.length === 0 && <div style={muted}>(catálogo vacío)</div>}
              {categorias.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectCategoria(c)}
                  style={{ ...pill, background: selCat?.id === c.id ? "#e6f0ff" : "#f7f7f7" }}
                >
                  {c.nombre}
                </button>
              ))}
            </div>

            {selCat && (
              <>
                <div style={{ margin: "12px 0 6px", fontWeight: 600 }}>
                  Subcategorías · <span style={{ color: "#666" }}>{selCat.nombre}</span>
                </div>
                <div style={gridWrap}>
                  {subcategorias.length === 0 && <div style={muted}>(sin subcategorías)</div>}
                  {subcategorias.map(s => (
                    <button
                      key={s.id}
                      onClick={() => onSelectSubcategoria(s)}
                      style={{ ...pill, background: selSub?.id === s.id ? "#e6f0ff" : "#f7f7f7" }}
                    >
                      {s.nombre}
                    </button>
                  ))}
                </div>
              </>
            )}

            {selSub && (
              <>
                <div style={{ margin: "12px 0 6px", fontWeight: 600 }}>
                  Productos · <span style={{ color: "#666" }}>{selSub.nombre}</span>
                </div>
                <div style={gridWrap}>
                  {productos.length === 0 && <div style={muted}>(sin productos)</div>}
                  {productos.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addProducto(p)}
                      style={{ ...cardBtn }}
                      title={`Añadir x${qty}`}
                    >
                      <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                      <div style={{ fontSize: 13, color: "#555" }}>{Number(p.precio).toFixed(2)} €</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Columna derecha: líneas del ticket */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Líneas</div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, minHeight: 280 }}>
            {(ticket?.lineas || []).length === 0 && (
              <div style={muted}>Sin líneas todavía.</div>
            )}
            {(ticket?.lineas || []).map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 4px", borderBottom: "1px solid #f3f3f3" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 28, textAlign: "right" }}>x{l.cantidad}</div>
                  <div>{l.producto_nombre || l.producto?.nombre || "Producto"}</div>
                </div>
                <div style={{ fontVariantNumeric: "tabular-nums" }}>
                  {(Number(l.precio_unitario) * Number(l.cantidad)).toFixed(2)} €
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, marginTop: 8 }}>
              <div style={{ fontWeight: 600 }}>Subtotal</div>
              <div style={{ fontWeight: 600 }}>{subtotal.toFixed(2)} €</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────── estilos inline mínimos ─────────────
const btnSecondary = {
  padding: "8px 12px",
  border: "1px solid #333",
  borderRadius: 6,
  background: "#eee",
  cursor: "pointer"
};
const btnDanger = {
  padding: "8px 12px",
  border: "1px solid #a33",
  borderRadius: 6,
  background: "#f8d7da",
  cursor: "pointer"
};
const gridWrap = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
  gap: 8
};
const pill = {
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
  textAlign: "center"
};
const cardBtn = {
  padding: 12,
  border: "1px solid #ccc",
  borderRadius: 8,
  background: "#fff",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 4
};
const muted = { color: "#777", fontSize: 13 };