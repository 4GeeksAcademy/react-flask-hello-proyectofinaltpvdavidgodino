// src/front/components/PricePad.jsx
import React, { useEffect, useState } from "react";

export default function PricePad({ open, initial = 0, onConfirm, onClose }) {
  const [value, setValue] = useState(() => (Number(initial) || 0).toFixed(2));

  useEffect(() => {
    if (open) setValue((Number(initial) || 0).toFixed(2));
  }, [open, initial]);

  if (!open) return null;

  function toCents(v) {
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  }
  function fromCents(c) {
    return (c / 100).toFixed(2);
  }

  function handleDigit(d) {
    // Trabajamos en céntimos
    const cents = toCents(value);
    const newCents = cents * 10 + d;
    setValue(fromCents(newCents));
  }

  function handleDel() {
    const cents = toCents(value);
    const newCents = Math.floor(cents / 10);
    setValue(fromCents(newCents));
  }

  function handleClear() {
    setValue("0.00");
  }

  function confirm() {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return;
    onConfirm?.(Number(n.toFixed(2)));
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Precio</h3>
        <div style={styles.display}>{value} €</div>

        <div style={styles.grid}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} style={styles.key} onClick={() => handleDigit(n)}>{n}</button>
          ))}
          <button style={styles.key} onClick={handleClear}>C</button>
          <button style={styles.key} onClick={() => handleDigit(0)}>0</button>
          <button style={styles.key} onClick={handleDel}>⌫</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={styles.btnSec}>Cancelar</button>
          <button onClick={confirm} style={styles.btnPri}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
  },
  modal: {
    background: "#fff", borderRadius: 8, padding: 16, width: 320,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)", fontFamily: "sans-serif"
  },
  display: {
    border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px",
    textAlign: "right", fontSize: 20, marginBottom: 8
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8
  },
  key: {
    padding: "12px 0", borderRadius: 6, border: "1px solid #ccc",
    background: "#f6f6f6", fontSize: 16, cursor: "pointer"
  },
  btnSec: {
    flex: 1, padding: "10px 12px", borderRadius: 6, border: "1px solid #bbb", background: "#eee"
  },
  btnPri: {
    flex: 1, padding: "10px 12px", borderRadius: 6, border: "1px solid #2a5", background: "#2a5", color: "#fff"
  }
};