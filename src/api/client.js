import { API_URL } from "../config/api.js";

export function assetUrl(url) {
  return url || "";
}

export async function api(path, options = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("tala_token");
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  const endpoint = path.startsWith("/") ? path : `/${path}`;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Une erreur est survenue");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
