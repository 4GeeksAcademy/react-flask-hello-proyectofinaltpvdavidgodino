// src/front/pages/admin/Catalog.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../../api/client.js";

export default function AdminCatalog() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [catNombre, setCatNombre] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Cargar categorías al entrar
  async function loadCategorias() {
    setLoading(true);
    try {
      const data = await apiGet("/admin/catalogo/categorias");
      // Normaliza por si el backend devuelve distinto casing
      setCategorias(
        (Array.isArray(data) ? data : []).map((c) => ({
          id: c.id,
          nombre: c.nombre,
          descripcion: c.descripcion || "",
          created_at: c.created_at,
        }))
      );
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategorias(); }, []);

  // Crear categoría
  async function onCrearCategoria(e) {
    e.preventDefault();
    if (!catNombre.trim()) {
      alert("Introduce un nombre de categoría");
      return;
    }
    try {
      await apiPost("/admin/catalogo/categorias", {
        nombre: catNombre.trim(),
        descripcion: catDesc.trim() || ""
      });
      setCatNombre("");
      setCatDesc("");
      await loadCategorias(); // ← refrescamos lista tras crear
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo crear la categoría");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => nav("/mesas")}>← Mesas</button>
        <h1 style={{ margin: 0 }}>Catálogo (Admin)</h1>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Categorías</h2>

        <form onSubmit={onCrearCategoria} style={{ display: "grid", gap: 8, maxWidth: 420, marginBottom: 16 }}>
          <input
            placeholder="Nombre de la categoría"
            value={catNombre}
            onChange={(e) => setCatNombre(e.target.value)}
          />
          <input
            placeholder="Descripción (opcional)"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
          />
          <div>
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Añadir categoría"}
            </button>
          </div>
        </form>

        {/* listado simple para verificar persistencia */}
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 12 }}>
          {loading && categorias.length === 0 ? (
            <div>Cargando…</div>
          ) : categorias.length === 0 ? (
            <div style={{ color: "#666" }}>No hay categorías todavía.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {categorias.map((c) => (
                <li key={c.id} style={{ margin: "6px 0" }}>
                  <strong>{c.nombre}</strong>
                  {c.descripcion ? <span> — {c.descripcion}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Placeholders para siguientes pasos: subcategorías y productos */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Subcategorías</h2>
        <div style={{ color: "#666" }}>
          Próximo paso: seleccionar categoría y gestionar sus subcategorías aquí.
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>Productos</h2>
        <div style={{ color: "#666" }}>
          Próximo paso: productos por subcategoría + PricePad (solo admin).
        </div>
      </section>
    </div>
  );
}