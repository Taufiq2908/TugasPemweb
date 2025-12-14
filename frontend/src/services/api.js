import { baseURL } from "../config/api";

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function apiGet(path, token) {
  const res = await fetch(baseURL + path, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}

export async function apiPost(path, body, token) {
  const res = await fetch(baseURL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(body)
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}

export async function apiPut(path, body, token) {
  const res = await fetch(baseURL + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(body)
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}
