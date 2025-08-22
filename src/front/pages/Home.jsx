import React from "react";
import { API_BASE } from "../../api/client";

export default function Home() {
  return (
    <div>
      <h2>Home</h2>
      <p>Front funcionando ✅</p>
      <p><strong>API_BASE:</strong> {API_BASE}</p>
      <p>
        Prueba <code>/login</code> para iniciar sesión y luego ve a <code>/tickets</code>.
      </p>
    </div>
  );
}