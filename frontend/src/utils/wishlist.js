const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function toggleWishlist(userId, placeId, isFavorite) {
  if (!userId) {
    return { success: false, message: "User belum login" };
  }

  try {
    // Hapus dari wishlist
    if (isFavorite) {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          place_id: placeId,
        }),
      });

      const data = await res.json();
      return { success: res.ok, data };
    }

    // Tambahkan ke wishlist
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
