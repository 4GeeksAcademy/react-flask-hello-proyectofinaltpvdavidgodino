// src/api/client.js
const RAW = import.meta.env.VITE_BACKEND_URL || "";
const BASE = RAW.replace(/\/+$/, ""); // quita barras finales

const join = (p) => (p?.startsWith("/") ? p : `/${p || ""}`);

async function request(method, path, body) {
  // lee token bajo ambas claves, por si el login guardó "access_token"
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  const res = await fetch(BASE + join(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // el backend puede devolver 204 o body vacío
  }

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