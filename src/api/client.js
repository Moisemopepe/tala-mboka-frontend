import { API_URL } from "../config/api.js";

export function assetUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const apiRoot = API_URL.replace(/\/api\/?$/, "");
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiRoot}${normalizedPath}`;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("tala_token");
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  const endpoint = path.startsWith("/") ? path : `/${path}`;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Une erreur est survenue");
    error.status = response.status;
    error.data = data;
    if (response.status === 401 && !endpoint.includes("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("tala_token");
      localStorage.removeItem("tala_user");
      window.dispatchEvent(new CustomEvent("tala:session-expired"));
    }
    throw error;
  }

  return data;
}

export async function downloadApiFile(path, filename) {
  const token = localStorage.getItem("token") || localStorage.getItem("tala_token");
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    throw new Error("Export unavailable");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
