import React from "react";

export default function NumPad({ value, onChange, onAdd, min = 1, max = 999 }) {
  const set = (v) => {
    const n = Math.max(min, Math.min(max, v));
    onChange(n);
  };

  const press = (digit) => {
    const s = String(value ?? "");
    const n = Number((s === "0" ? "" : s) + digit);
    if (!Number.isNaN(n)) set(n);
  };

  const back = () => {
    const s = String(value ?? "");
    const n = s.length > 1 ? Number(s.slice(0, -1)) : min;
    set(n);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 8 }}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ gridColumn: "span 3", padding: 8, fontSize: 18, textAlign: "center", border: "1px solid #ccc", borderRadius: 6 }}
      />
      {[1,2,3,4,5,6,7,8,9].map(n => (
        <button key={n} onClick={() => press(n)} style={btnStyle}>{n}</button>
      ))}
      <button onClick={back} style={btnStyle}>⌫</button>
      <button onClick={() => press(0)} style={btnStyle}>0</button>
      <button onClick={onAdd} style={{ ...btnStyle, background: "#e6f0ff", borderColor: "#99b" }}>Añadir</button>
    </div>
  );
}

const btnStyle = {
  padding: "12px 0",
  fontSize: 18,
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#f7f7f7",
  cursor: "pointer"
};