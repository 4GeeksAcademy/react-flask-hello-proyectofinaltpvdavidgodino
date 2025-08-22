// src/api/client.js
// Detecta automáticamente el backend en Codespaces: -3000 -> -5000
const inferApiBase = () => {
  const { origin } = window.location;
  if (origin.includes("-3000") && origin.includes(".app.github.dev")) {
    return origin.replace("-3000", "-5000") + "/api";
  }
  // fallback local
  return "http://localhost:5000/api";
};

const API_BASE = inferApiBase();

export const getToken = () => sessionStorage.getItem("token");
export const setToken = (t) => sessionStorage.setItem("token", t);
export const clearToken = () => sessionStorage.removeItem("token");

const headers = () => {
  const h = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers() });
  if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}{path}`, { method: "DELETE", headers: headers() });
  if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
  return res.json();
}

export { API_BASE };