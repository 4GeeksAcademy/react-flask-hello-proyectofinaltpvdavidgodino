// src/front/pages/admin/Catalog.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../api/client";

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "#fff",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminCatalog() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState([]);
  const [newCat, setNewCat] = useState("");

  async function load() {
    setLoading(true);
    try {
      // GET /api/admin/catalogo/categorias
      const data = await apiGet("/admin/catalogo/categorias");
      setCats(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategory(e) {
    e?.preventDefault?.();
    const nombre = newCat.trim();
    if (!nombre) return;

    try {
      // POST /api/admin/catalogo/categorias { nombre }
      const created = await apiPost("/admin/catalogo/categorias", { nombre });
      setCats((prev) => [...prev, created]);
      setNewCat("");
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo crear la categoría");
    }
  }

  async function renameCategory(catId, oldName) {
    const nombre = prompt("Nuevo nombre para la categoría:", oldName || "");
    if (nombre == null) return; // cancelado
    const trimmed = nombre.trim();
    if (!trimmed || trimmed === oldName) return;

    try {
      // PATCH /api/admin/catalogo/categorias/:id { nombre }
      const updated = await apiPatch(`/admin/catalogo/categorias/${catId}`, {
        nombre: trimmed,
      });
      setCats((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, ...updated } : c))
      );
    } catch (e) {
      console.error(e);
      alert(e?.error || "No se pudo renombrar la categoría");
    }
  }

  async function deleteCategory(catId) {
    if (!confirm("¿Eliminar esta categoría? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      // DELETE /api/admin/catalogo/categorias/:id
      await apiDelete(`/admin/catalogo/categorias/${catId}`);
      setCats((prev) => prev.filter((c) => c.id !== catId));
    } catch (e) {
      console.error(e);
      alert(
        e?.error ||
          "No se pudo eliminar la categoría (puede tener subcategorías o productos)."
      );
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 900 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => nav("/mesas")}
            style={{
              padding: "8px 12px",
              border: "1px solid #333",
              borderRadius: 6,
              background: "#eee",
              cursor: "pointer",
            }}
          >
            ← Mesas
          </button>
          <h1 style={{ margin: 0 }}>Catálogo (Admin)</h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "8px 12px",
            border: "1px solid #333",
            borderRadius: 6,
            background: "#eee",
            cursor: "pointer",
          }}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Categorías */}
      <Section title="Categorías">
        <form
          onSubmit={createCategory}
          style={{ display: "flex", gap: 8, marginBottom: 12 }}
        >
          <input
            type="text"
            placeholder="Nombre de categoría"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          />
          <button
            type="submit"
            disabled={loading || !newCat.trim()}
            style={{
              padding: "8px 12px",
              border: "1px solid #333",
              borderRadius: 6,
              background: "#e6f0ff",
              cursor: "pointer",
            }}
          >
            + Categoría
          </button>
        </form>

        {cats.length === 0 ? (
          <div style={{ color: "#666" }}>
            No hay categorías todavía.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            }}
          >
            {cats.map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                  background: "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.nombre}</div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => renameCategory(c.id, c.nombre)}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #333",
                      borderRadius: 6,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Renombrar
                  </button>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #c33",
                      borderRadius: 6,
                      background: "#ffecec",
                      color: "#a00",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </div>

                {/* Placeholder para subcategorías / productos (siguiente fase) */}
                <div style={{ fontSize: 12, color: "#888" }}>
                  (Aquí mostraremos subcategorías y productos)
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Placeholders de próximas secciones */}
      <Section title="Subcategorías (próxima fase)">
        <div style={{ color: "#666" }}>
          Primero cerremos el CRUD de categorías. Luego añadimos subcategorías con
          selección de categoría padre y su propio CRUD.
        </div>
      </Section>

      <Section title="Productos (próxima fase)">
        <div style={{ color: "#666" }}>
          Tras subcategorías, añadiremos productos con PricePad (solo admin) y
          se vincularán a la subcategoría.
        </div>
      </Section>
    </div>
  );
}