// src/front/pages/admin/Catalog.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../../api/client"; // ← ojo a la ruta

// Fallbacks simples si tu client no expone PATCH/DELETE:
async function apiPatch(url, body) {
  const res = await fetch(import.meta.env.VITE_BACKEND_URL + url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
  return res.json();
}
async function apiDelete(url) {
  const res = await fetch(import.meta.env.VITE_BACKEND_URL + url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
  if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
  return res.json();
}

// ─────────────────────────────────────────────────────────
// PricePad: teclado numérico para precios (solo admin)
// ─────────────────────────────────────────────────────────
function PricePad({ value = "0", onClose, onAccept }) {
  const [txt, setTxt] = useState(String(value ?? "0"));

  function press(n) {
    if (n === "C") return setTxt("0");
    if (n === "←") return setTxt((t) => (t.length <= 1 ? "0" : t.slice(0, -1)));
    if (n === ".") {
      if (!txt.includes(".")) setTxt(txt + ".");
      return;
    }
    // número
    setTxt((t) => {
      const next = t === "0" ? String(n) : t + String(n);
      return next;
    });
  }

  function accept() {
    const num = parseFloat(txt);
    if (isNaN(num)) return alert("Precio inválido");
    onAccept(num);
  }

  const keys = ["7","8","9","4","5","6","1","2","3",".","0","←","C"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 11
    }}>
      <div style={{ background: "#fff", padding: 16, width: 320, borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Precio</h3>
        <div style={{
          border: "1px solid #ccc", borderRadius: 6, padding: 12, fontSize: 24,
          textAlign: "right", marginBottom: 12
        }}>
          {txt}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {keys.map((k) => (
            <button key={k} onClick={() => press(k)} style={{ padding: 12, borderRadius: 8 }}>
              {k}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={accept} style={{ background: "#222", color: "#fff" }}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// UI principal
// ─────────────────────────────────────────────────────────
export default function AdminCatalog() {
  const nav = useNavigate();

  // Estado
  const [categorias, setCategorias] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);

  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);

  const [productos, setProductos] = useState([]);

  // formularios rápidos
  const [newCatName, setNewCatName] = useState("");
  const [editCatId, setEditCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");

  const [newSubName, setNewSubName] = useState("");
  const [editSubId, setEditSubId] = useState(null);
  const [editSubName, setEditSubName] = useState("");

  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState(null);
  const [showPad, setShowPad] = useState(false);

  const [editingProd, setEditingProd] = useState(null); // {id,nombre,precio}
  const [showPadEdit, setShowPadEdit] = useState(false);

  // Cargar categorías al abrir
  async function loadCategorias() {
    const data = await apiGet("/admin/catalogo/categorias");
    setCategorias(data);
    // si no hay selección y existen, auto seleccionar primera
    if (!selectedCat && data.length > 0) setSelectedCat(data[0]);
  }

  // Cargar subcategorías y productos al cambiar selección
  async function loadSubcategorias(categoria_id) {
    if (!categoria_id) { setSubcategorias([]); return; }
    const data = await apiGet(`/admin/catalogo/subcategorias?categoria_id=${categoria_id}`);
    setSubcategorias(data);
    // reset selección subcategoria si ya no encaja
    if (!data.find(s => s.id === selectedSub?.id)) {
      setSelectedSub(data[0] || null);
    }
  }

  async function loadProductos(subcategoria_id) {
    if (!subcategoria_id) { setProductos([]); return; }
    const data = await apiGet(`/admin/catalogo/productos?subcategoria_id=${subcategoria_id}`);
    setProductos(data);
  }

  // efectos
  useEffect(() => { loadCategorias(); }, []);
  useEffect(() => { if (selectedCat) loadSubcategorias(selectedCat.id); }, [selectedCat?.id]);
  useEffect(() => { if (selectedSub) loadProductos(selectedSub.id); }, [selectedSub?.id]);

  // ───────── CATEGORÍAS
  async function onCreateCat() {
    const nombre = newCatName.trim();
    if (!nombre) return;
    try {
      await apiPost("/admin/catalogo/categorias", { nombre });
      setNewCatName("");
      await loadCategorias();
    } catch (e) {
      alert(e?.error || "No se pudo crear la categoría");
    }
  }
  function onStartEditCat(c) {
    setEditCatId(c.id); setEditCatName(c.nombre);
  }
  async function onSaveEditCat() {
    try {
      await apiPatch(`/admin/catalogo/categorias/${editCatId}`, { nombre: editCatName.trim() });
      setEditCatId(null); setEditCatName("");
      await loadCategorias();
    } catch (e) {
      alert(e?.error || "No se pudo editar la categoría");
    }
  }
  async function onDeleteCat(c) {
    if (!confirm(`Eliminar categoría "${c.nombre}" y su contenido?`)) return;
    try {
      await apiDelete(`/admin/catalogo/categorias/${c.id}`);
      if (selectedCat?.id === c.id) { setSelectedCat(null); setSubcategorias([]); setSelectedSub(null); setProductos([]); }
      await loadCategorias();
    } catch (e) {
      alert(e?.error || "No se pudo eliminar la categoría");
    }
  }

  // ───────── SUBCATEGORÍAS
  async function onCreateSub() {
    const nombre = newSubName.trim();
    if (!nombre || !selectedCat) return;
    try {
      await apiPost("/admin/catalogo/subcategorias", { categoria_id: selectedCat.id, nombre });
      setNewSubName("");
      await loadSubcategorias(selectedCat.id);
    } catch (e) {
      alert(e?.error || "No se pudo crear la subcategoría");
    }
  }
  function onStartEditSub(s) {
    setEditSubId(s.id); setEditSubName(s.nombre);
  }
  async function onSaveEditSub() {
    try {
      await apiPatch(`/admin/catalogo/subcategorias/${editSubId}`, { nombre: editSubName.trim() });
      setEditSubId(null); setEditSubName("");
      await loadSubcategorias(selectedCat?.id);
    } catch (e) {
      alert(e?.error || "No se pudo editar la subcategoría");
    }
  }
  async function onDeleteSub(s) {
    if (!confirm(`Eliminar subcategoría "${s.nombre}" y sus productos?`)) return;
    try {
      await apiDelete(`/admin/catalogo/subcategorias/${s.id}`);
      if (selectedSub?.id === s.id) { setSelectedSub(null); setProductos([]); }
      await loadSubcategorias(selectedCat?.id);
    } catch (e) {
      alert(e?.error || "No se pudo eliminar la subcategoría");
    }
  }

  // ───────── PRODUCTOS (con PricePad)
  async function onCreateProd() {
    if (!selectedSub) return alert("Selecciona una subcategoría");
    if (!newProdName.trim()) return alert("Nombre obligatorio");
    if (newProdPrice == null) return setShowPad(true); // fuerza abrir pad
    try {
      await apiPost("/admin/catalogo/productos", {
        subcategoria_id: selectedSub.id,
        nombre: newProdName.trim(),
        precio: newProdPrice
      });
      setNewProdName(""); setNewProdPrice(null);
      await loadProductos(selectedSub.id);
    } catch (e) {
      alert(e?.error || "No se pudo crear el producto");
    }
  }
  function onOpenPadForCreate() { setShowPad(true); }
  function onPadAcceptCreate(price) { setNewProdPrice(price); setShowPad(false); }

  function onStartEditProd(p) {
    setEditingProd({ ...p });
  }
  async function onSaveEditProd() {
    try {
      await apiPatch(`/admin/catalogo/productos/${editingProd.id}`, {
        nombre: editingProd.nombre,
        precio: editingProd.precio
      });
      setEditingProd(null);
      await loadProductos(selectedSub?.id);
    } catch (e) {
      alert(e?.error || "No se pudo editar el producto");
    }
  }
  async function onDeleteProd(p) {
    if (!confirm(`Eliminar producto "${p.nombre}"?`)) return;
    try {
      await apiDelete(`/admin/catalogo/productos/${p.id}`);
      await loadProductos(selectedSub?.id);
    } catch (e) {
      alert(e?.error || "No se pudo eliminar el producto");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => nav("/mesas")}>← Mesas</button>
        <h1 style={{ margin: 0 }}>Catálogo (Admin)</h1>
        <div />
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr 2fr" }}>
        {/* Panel Categorías */}
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Categorías</h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              placeholder="Nueva categoría"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <button onClick={onCreateCat}>Añadir</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflow: "auto" }}>
            {categorias.map(c => (
              <div key={c.id} style={{
                border: "1px solid #eee", borderRadius: 6, padding: 8,
                background: selectedCat?.id === c.id ? "#eef6ff" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8
              }}>
                <div onClick={() => setSelectedCat(c)} style={{ cursor: "pointer", flex: 1 }}>
                  {c.nombre}
                </div>
                {editCatId === c.id ? (
                  <>
                    <input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} />
                    <button onClick={onSaveEditCat}>Guardar</button>
                    <button onClick={() => { setEditCatId(null); setEditCatName(""); }}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => onStartEditCat(c)}>Editar</button>
                    <button onClick={() => onDeleteCat(c)} style={{ color: "#b00020" }}>Eliminar</button>
                  </>
                )}
              </div>
            ))}
            {categorias.length === 0 && <div style={{ color: "#666" }}>Sin categorías.</div>}
          </div>
        </section>

        {/* Panel Subcategorías */}
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Subcategorías</h3>
          {selectedCat ? (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder={`Nueva subcategoría en "${selectedCat.nombre}"`}
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                />
                <button onClick={onCreateSub}>Añadir</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflow: "auto" }}>
                {subcategorias.map(s => (
                  <div key={s.id} style={{
                    border: "1px solid #eee", borderRadius: 6, padding: 8,
                    background: selectedSub?.id === s.id ? "#eef6ff" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8
                  }}>
                    <div onClick={() => setSelectedSub(s)} style={{ cursor: "pointer", flex: 1 }}>
                      {s.nombre}
                    </div>
                    {editSubId === s.id ? (
                      <>
                        <input value={editSubName} onChange={(e) => setEditSubName(e.target.value)} />
                        <button onClick={onSaveEditSub}>Guardar</button>
                        <button onClick={() => { setEditSubId(null); setEditSubName(""); }}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => onStartEditSub(s)}>Editar</button>
                        <button onClick={() => onDeleteSub(s)} style={{ color: "#b00020" }}>Eliminar</button>
                      </>
                    )}
                  </div>
                ))}
                {subcategorias.length === 0 && <div style={{ color: "#666" }}>Sin subcategorías.</div>}
              </div>
            </>
          ) : (
            <div style={{ color: "#666" }}>Selecciona una categoría.</div>
          )}
        </section>

        {/* Panel Productos */}
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Productos</h3>
          {selectedSub ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr auto", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder={`Nuevo producto en "${selectedSub.nombre}"`}
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                />
                <button onClick={onOpenPadForCreate}>
                  {newProdPrice == null ? "Precio" : `${newProdPrice.toFixed(2)} €`}
                </button>
                <button onClick={onCreateProd}>Añadir</button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {productos.map(p => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px auto auto", gap: 8, alignItems: "center", border: "1px solid #eee", borderRadius: 6, padding: 8 }}>
                    {editingProd?.id === p.id ? (
                      <>
                        <input
                          value={editingProd.nombre}
                          onChange={(e) => setEditingProd({ ...editingProd, nombre: e.target.value })}
                        />
                        <button onClick={() => setShowPadEdit(true)}>
                          {editingProd.precio != null ? `${Number(editingProd.precio).toFixed(2)} €` : "Precio"}
                        </button>
                        <button onClick={onSaveEditProd}>Guardar</button>
                        <button onClick={() => setEditingProd(null)}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <div>{p.nombre}</div>
                        <div style={{ textAlign: "right" }}>{Number(p.precio).toFixed(2)} €</div>
                        <button onClick={() => onStartEditProd(p)}>Editar</button>
                        <button onClick={() => onDeleteProd(p)} style={{ color: "#b00020" }}>Eliminar</button>
                      </>
                    )}
                  </div>
                ))}
                {productos.length === 0 && <div style={{ color: "#666" }}>Sin productos.</div>}
              </div>
            </>
          ) : (
            <div style={{ color: "#666" }}>Selecciona una subcategoría.</div>
          )}
        </section>
      </div>

      {/* PricePad (crear) */}
      {showPad && (
        <PricePad
          value={newProdPrice ?? "0"}
          onClose={() => setShowPad(false)}
          onAccept={(price) => onPadAcceptCreate(price)}
        />
      )}

      {/* PricePad (editar) */}
      {showPadEdit && editingProd && (
        <PricePad
          value={editingProd.precio ?? "0"}
          onClose={() => setShowPadEdit(false)}
          onAccept={(price) => { setEditingProd({ ...editingProd, precio: price }); setShowPadEdit(false); }}
        />
      )}
    </div>
  );
}