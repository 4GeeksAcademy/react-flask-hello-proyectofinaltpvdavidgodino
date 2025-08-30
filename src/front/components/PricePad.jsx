import React from "react";
export default function PricePad({ value, onChange }) {
  const push = (ch) => onChange(String(value || "") + ch);
  const clear = () => onChange("");
  const back  = () => onChange(String(value || "").slice(0, -1));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 8 }}>
      {[1,2,3,4,5,6,7,8,9].map(n => (
        <button key={n} onClick={() => push(String(n))}>{n}</button>
      ))}
      <button onClick={clear}>C</button>
      <button onClick={() => push("0")}>0</button>
      <button onClick={() => push(".")}>.</button>
      <button onClick={back} style={{ gridColumn: "span 3" }}>⌫</button>
    </div>
  );
}