// src/front/pages/admin/Catalog.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../../api/client"; // 

export default function AdminCatalog() {
  const nav = useNavigate();

  // árbol completo
  const [tree, setTree] = useState([]);
  // selección actual (para añadir subcategorías o productos)
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const [loading, setLoading] = useState(false);

  async function loadTree() {
    setLoading(true);
    try {
      // Endpoint de lectura del árbol (usa el que montamos en el back)
      // Si en tu back el nombre es distinto, cámbialo aquí.
      // Opción A (la que te dejé en admin_catalog_routes): /api/admin/catalogo/tree
      // Opción B fallback: /api/admin/catalogo/arbol
      let data;
      try {
        data = await apiGet("/admin/catalogo/tree");
      } catch {
        data = await apiGet("/admin/catalogo/arbol");
      }
      setTree(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e?.error || "No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTree(); }, []);

  // ──────────────── Creaciones ────────────────
  async function onAddCategoria() {
    const nombre = prompt("Nombre de la categoría:");
    if (!nombre) return;
    try {
      await apiPost("/admin/catalogo/categorias", { nombre });
      await loadTree();
    } catch (e) {
      alert(e?.error || "No se pudo crear la categoría");
    }
  }

  async function onAddSubcategoria() {
    if (!selectedCat) {
      alert("Selecciona primero una categoría.");
      return;
    }
    const nombre = prompt(`Nueva subcategoría para "${selectedCat.nombre}":`);
    if (!nombre) return;
    try {
      await apiPost("/admin/catalogo/subcategorias", {
        nombre,
        categoria_id: selectedCat.id,
      });
      await loadTree();
    } catch (e) {
      alert(e?.error || "No se pudo crear la subcategoría");
    }
  }

  async function onAddProducto() {
    if (!selectedSub) {
      alert("Selecciona primero una subcategoría.");
      return;
    }
    const nombre = prompt(`Nombre del producto para "${selectedSub.nombre}":`);
    if (!nombre) return;

    // PricePad simple (de momento prompt); más adelante lo sustituimos por el teclado fijo
    const precioStr = prompt("Precio (ej. 2.20):");
    if (!precioStr) return;

    // Normalizamos decimal con punto
    const precio = Number(String(precioStr).replace(",", "."));
    if (Number.isNaN(precio) || precio < 0) {
      alert("Precio inválido");
      return;
    }

    try {
      await apiPost("/admin/catalogo/productos", {
        nombre,
        precio,
        subcategoria_id: selectedSub.id,
      });
      await loadTree();
    } catch (e) {
      alert(e?.error || "No se pudo crear el producto");
    }
  }

  // ──────────────── Render helpers ────────────────
  function Row({ children, onClick, active, level = 0 }) {
    return (
      <div
        onClick={onClick}
        style={{
          padding: "6px 10px",
          margin: "4px 0",
          borderRadius: 6,
          cursor: onClick ? "pointer" : "default",
          background: active ? "#eef5ff" : "transparent",
          border: active ? "1px solid #9cc1ff" : "1px solid transparent",
          paddingLeft: 10 + level * 18,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button
          onClick={() => nav("/mesas")}
          style={{ padding: "8px 12px", border: "1px solid #333", borderRadius: 6, background: "#eee" }}
        >
          ← Mesas
        </button>

        <h1 style={{ margin: 0 }}>Catálogo (Admin)</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={onAddCategoria}>+ Categoría</button>
        <button onClick={onAddSubcategoria} disabled={!selectedCat}>+ Subcategoría</button>
        <button onClick={onAddProducto} disabled={!selectedSub}>+ Producto</button>
      </div>

      {loading && <div style={{ margin: "8px 0" }}>Cargando catálogo…</div>}

      {/* Árbol simple */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        {tree.length === 0 && <div style={{ color: "#666" }}>No hay categorías todavía.</div>}

        {tree.map(cat => (
          <div key={`cat-${cat.id}`}>
            <Row
              level={0}
              onClick={() => {
                setSelectedCat(cat);
                setSelectedSub(null);
              }}
              active={selectedCat?.id === cat.id}
            >
              <strong>📁 {cat.nombre}</strong>
            </Row>

            {(cat.subcategorias || []).map(sub => (
              <div key={`sub-${sub.id}`}>
                <Row
                  level={1}
                  onClick={() => {
                    setSelectedCat(cat);
                    setSelectedSub(sub);
                  }}
                  active={selectedSub?.id === sub.id}
                >
                  <span>📂 {sub.nombre}</span>
                </Row>

                {(sub.productos || []).map(p => (
                  <Row key={`prod-${p.id}`} level={2}>
                    <span>🧾 {p.nombre}</span>
                    <span style={{ marginLeft: 8, color: "#444" }}>
                      — {Number(p.precio).toFixed(2)} €
                    </span>
                  </Row>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}