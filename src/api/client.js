const API_BASE = import.meta.env.VITE_BACKEND_URL;  // 👈 Directo del .env

export const getToken   = () => sessionStorage.getItem("token");
export const setToken   = (t) => sessionStorage.setItem("token", t);
export const clearToken = () => sessionStorage.removeItem("token");

const headers = () => {
  const h = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};

async function handle(res) {
  if (!res.ok) {
    throw await res.json().catch(() => ({
      error: res.statusText,
      status: res.status
    }));
  }
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers() });
  return handle(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body ?? {}),
  });
  return handle(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handle(res);
}

export { API_BASE };