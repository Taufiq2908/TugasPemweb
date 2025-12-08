// src/helpers/checkUserLocation.js

import { API_BASE } from "../config";

export async function checkUserLocation(user) {
  if (!user) return;

  // Ambil lokasi dari browser
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      console.log("📍 Mengirim lokasi ke server:", latitude, longitude);

      await fetch(`${API_BASE}/users/check-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          lat: latitude,
          lon: longitude,
        }),
      });
    },
    (err) => {
      console.warn("Gagal ambil lokasi:", err);
    }
  );
}
