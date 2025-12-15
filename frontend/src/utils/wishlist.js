const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function toggleWishlist(userId, placeId, isFavorite) {
  // 1. AMBIL TOKEN
  const token = localStorage.getItem("makanKi_token");

  if (!userId || !token) {
    return { success: false, message: "User belum login" };
  }

  try {
    const url = `${API_BASE}/wishlist`;
    const method = isFavorite ? "DELETE" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // 🔥 WAJIB ADA TOKEN
      },
      body: JSON.stringify({
        user_id: userId,
        place_id: placeId,
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error("Wishlist error:", err);
    return { success: false, message: "Error koneksi" };
  }
}