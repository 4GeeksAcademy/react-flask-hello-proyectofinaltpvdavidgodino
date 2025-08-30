// src/front/pages/admin/Catalog.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCatalog() {
  const nav = useNavigate();

  // Estado “dummy” solo para que se vean las selecciones
  const [categorias] = useState(["Bebidas", "Comida"]);
  const [selCat, setSelCat] = useState("");
  const [subcats] = useState(["Ginebra", "Vodka", "Ron"]);
  const [selSub, setSelSub] = useState("");

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => nav("/mesas")}>← Volver</button>
        <h1 style={{ margin: 0 }}>Catálogo (Admin)</h1>
      </div>

      {/* CATEGORÍAS */}
      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Categorías</h2>
          <button onClick={() => alert("Añadir categoría (WIP)")}>
            + Añadir categoría
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => { setSelCat(c); setSelSub(""); }}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: selCat === c ? "2px solid #333" : "1px solid #ccc",
                background: selCat === c ? "#f1f1f1" : "#fff",
                cursor: "pointer"
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* SUBCATEGORÍAS (dependen de categoría seleccionada) */}
      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16, opacity: selCat ? 1 : 0.5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            Subcategorías {selCat ? `de ${selCat}` : "(elige una categoría)"}
          </h2>
          <button disabled={!selCat} onClick={() => alert(`Añadir subcategoría en ${selCat} (WIP)`)}>
            + Añadir subcategoría
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(selCat ? subcats : []).map((s) => (
            <button
              key={s}
              onClick={() => setSelSub(s)}
              disabled={!selCat}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: selSub === s ? "2px solid #333" : "1px solid #ccc",
                background: selSub === s ? "#f1f1f1" : "#fff",
                cursor: selCat ? "pointer" : "not-allowed"
              }}
            >
              {s}
            </button>
          ))}
          {!selCat && <div style={{ color: "#777" }}>Selecciona primero una categoría</div>}
        </div>
      </section>

      {/* PRODUCTOS (dependen de subcategoría seleccionada) */}
      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            Productos {selSub ? `en ${selSub}` : "(elige subcategoría)"}
          </h2>
          <button
            disabled={!selSub}
            onClick={() => alert(`Añadir producto en ${selSub} (abrir PricePad) (WIP)`)}
          >
            + Añadir producto
          </button>
        </div>

        {!selSub ? (
          <div style={{ color: "#777" }}>Selecciona una subcategoría para ver / añadir productos.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {/* Placeholder de tarjetas de producto */}
            {["Producto A", "Producto B", "Producto C"].map((p) => (
              <div key={p} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: "600", marginBottom: 6 }}>{p}</div>
                <div style={{ color: "#666", marginBottom: 10 }}>€ 0,00</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => alert(`Editar ${p} (WIP)`)}>Editar</button>
                  <button onClick={() => alert(`Eliminar ${p} (WIP)`)} style={{ borderColor: "#c00", color: "#c00" }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}