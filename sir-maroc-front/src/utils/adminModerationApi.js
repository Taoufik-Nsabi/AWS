import { parseError } from "./apiError";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

function buildHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

export async function fetchAdminLieux(type, status) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (status) params.set("status", status);

  const response = await fetch(`${API_BASE}/api/tourism/lieux/admin?${params.toString()}`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchLieuById(type, id) {
  const response = await fetch(`${API_BASE}/api/tourism/${type}/${id}`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateLieuStatus(type, id, status) {
  const response = await fetch(`${API_BASE}/api/tourism/${type}/${id}/status`, {
    method: "PUT",
    headers: buildHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
