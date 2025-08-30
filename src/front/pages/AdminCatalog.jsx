import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../api/client";
import PricePad from "../../components/PricePad";

function Field({ label, children }) {
  return (
    <label style={{ display: "block", margin: "6px 0" }}>
      <div style={{ fontSize: 12, color: "#555" }}>{label}</div>
      {children}
    </label>
  );
}

export default function Catalog() {
  const [tree, setTree] = useState([]);        // [{id,nombre,subcategorias:[{id,nombre,productos:[...] }]}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // formularios simples
  const [catName, setCatName] = useState("");
  const [subName, setSubName] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");

  const [currentCat, setCurrentCat] = useState(null);
  const [currentSub, setCurrentSub] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try {
      const data = await apiGet("/admin/catalogo/tree");
      setTree(data || []);
    } catch (e) {
      setError(e?.error || "No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // --- acciones categoría --------
  async function addCategory() {
    if (!catName.trim()) return;
    await apiPost("/admin/catalogo/categorias", { nombre: catName.trim() });
    setCatName(""); load();
  }
  async function delCategory(id) {
    if (!confirm("¿Eliminar categoría y todo su contenido?")) return;
    await apiDelete(`/admin/catalogo/categorias/${id}`);
    if (currentCat?.id === id) setCurrentCat(null);
    load();
  }

  // --- acciones subcategoría -------
  async function addSub(cat) {
    if (!subName.trim()) return;
    await apiPost("/admin/catalogo/subcategorias", { nombre: subName.trim(), categoria_id: cat.id });
    setSubName(""); load();
  }
  async function delSub(id) {
    if (!confirm("¿Eliminar subcategoría y sus productos?")) return;
    await apiDelete(`/admin/catalogo/subcategorias/${id}`);
    if (currentSub?.id === id) setCurrentSub(null);
    load();
  }

  // --- acciones producto --------
  async function addProd(sub) {
    const precioNum = Number(prodPrice.replace(",", "."));
    if (!prodName.trim() || isNaN(precioNum)) return alert("Nombre y precio válido requeridos");
    await apiPost("/admin/catalogo/productos", {
      nombre: prodName.trim(),
      precio: precioNum,
      subcategoria_id: sub.id,
    });
    setProdName(""); setProdPrice(""); load();
  }
  async function delProd(id) {
    if (!confirm("¿Eliminar producto?")) return;
    await apiDelete(`/admin/catalogo/productos/${id}`);
    load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Catálogo (Admin)</h1>
      {error && <div style={{ color: "#b00020", marginBottom: 8 }}>{error}</div>}
      <button onClick={load} disabled={loading}>{loading ? "Cargando..." : "Recargar"}</button>

      {/* Crear categoría */}
      <div style={{ margin: "16px 0", padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
        <h3>Nueva categoría</h3>
        <Field label="Nombre">
          <input value={catName} onChange={e => setCatName(e.target.value)} />
        </Field>
        <button onClick={addCategory}>Crear categoría</button>
      </div>

      {/* Árbol */}
      <div style={{ display: "grid", gap: 16 }}>
        {tree.map(cat => (
          <div key={cat.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>{cat.nombre}</h2>
              <div>
                <button onClick={() => delCategory(cat.id)}>Eliminar</button>
              </div>
            </div>

            {/* añadir subcategoría a una categoría */}
            <div style={{ display: "flex", alignItems: "end", gap: 8, margin: "8px 0 16px" }}>
              <Field label="Nueva subcategoría">
                <input value={subName} onChange={e => setSubName(e.target.value)} />
              </Field>
              <button onClick={() => addSub(cat)}>Añadir subcategoría</button>
            </div>

            {/* subcategorías */}
            <div style={{ display: "grid", gap: 12 }}>
              {(cat.subcategorias || []).map(sub => (
                <div key={sub.id} style={{ border: "1px dashed #ddd", borderRadius: 6, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>{sub.nombre}</h3>
                    <div><button onClick={() => delSub(sub.id)}>Eliminar</button></div>
                  </div>

                  {/* para añadir producto  */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "8px 0" }}>
                    <div>
                      <Field label="Nombre del producto">
                        <input value={prodName} onChange={e => setProdName(e.target.value)} />
                      </Field>
                      <Field label="Precio">
                        <input
                          value={prodPrice}
                          onChange={e => setProdPrice(e.target.value)}
                          placeholder="Ej: 12.50"
                          style={{ width: 120 }}
                        />
                      </Field>
                      <button onClick={() => addProd(sub)}>Añadir producto</button>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>PricePad</div>
                      <PricePad value={prodPrice} onChange={setProdPrice} />
                    </div>
                  </div>

                  {/* productos */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 6 }}>Producto</th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid #eee", padding: 6 }}>Precio (€)</th>
                        <th style={{ borderBottom: "1px solid #eee", padding: 6 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sub.productos || []).map(p => (
                        <tr key={p.id}>
                          <td style={{ padding: 6, borderBottom: "1px solid #f3f3f3" }}>{p.nombre}</td>
                          <td style={{ padding: 6, textAlign: "right", borderBottom: "1px solid #f3f3f3" }}>
                            {Number(p.precio).toFixed(2)}
                          </td>
                          <td style={{ padding: 6, textAlign: "right", borderBottom: "1px solid #f3f3f3" }}>
                            <button onClick={() => delProd(p.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                      {(sub.productos || []).length === 0 && (
                        <tr><td colSpan={3} style={{ padding: 6, color: "#777" }}>Sin productos</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
              {(cat.subcategorias || []).length === 0 && (
                <div style={{ color: "#777" }}>Sin subcategorías</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}