import { baseURL } from "../config/api";

export async function apiGet(path) {
  const res = await fetch(baseURL + path);
  return res.json();
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
  return res.json();
}
