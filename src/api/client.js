// src/api/client.js
const RAW = import.meta.env.VITE_BACKEND_URL || "";
// normaliza: sin barra final
const BASE = RAW.replace(/\/+$/, ""); // ej: https://...-3001.app.github.dev/api

// helper: asegura que path empieza con "/"
const join = (p) => {
  if (!p) return "";
  return p.startsWith("/") ? p : `/${p}`;
};

async function request(method, path, body) {
  const url = BASE + join(path); // BASE ya incluye /api; path será p.e. "/auth/login"

  const headers = { "Content-Type": "application/json" };

  // añade token si existe
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // intenta parsear json siempre
  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    const msg = data?.error || data?.msg || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export const apiGet = (path) => request("GET", path);
export const apiPost = (path, body) => request("POST", path, body);
export const apiPatch = (path, body) => request("PATCH", path, body);
export const apiDelete = (path, body) => request("DELETE", path, body);