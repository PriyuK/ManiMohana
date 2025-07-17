const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  
  const token = getToken();
 
  if (token) headers["Authorization"] = "Bearer " + token;
  headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  
  if (!res.ok) throw new Error((await res.json()).message || "API error");
  return res.json();
}