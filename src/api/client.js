// src/api/client.js
const RAW = import.meta.env.VITE_BACKEND_URL || "";
const BASE = RAW.replace(/\/+$/, ""); // normaliza (sin barra al final)

const join = (p) => (p?.startsWith("/") ? p : `/${p || ""}`);

async function request(method, path, body) {
  const url = BASE + join(path);
  const headers = { "Content-Type": "application/json" };

  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // intenta json; si no, cae a texto para mostrarlo en los alerts
  let data;
  let text;
  try {
    data = await res.json();
  } catch {
    try { text = await res.text(); } catch {}
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.msg ||
      text ||
      `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const apiGet    = (path) => request("GET",    path);
export const apiPost   = (path, body) => request("POST",   path, body);
export const apiPatch  = (path, body) => request("PATCH",  path, body);
export const apiDelete = (path, body) => request("DELETE", path, body);