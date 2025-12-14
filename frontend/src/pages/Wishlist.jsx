// frontend/pages/Wishlist.jsx
import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Wishlist = ({
  user,
  favorites = [],
  onToggleFavorite,
  onViewDetail, // ✅ ini yang dikirim dari App.jsx
  token
}) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // LOAD WISHLIST USER
  // ================================
  const fetchWishlist = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/wishlist/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memuat wishlist.");
        return;
      }

      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ================================
  // REMOVE FROM WISHLIST
  // ================================
  const handleRemove = async (placeId) => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: user.id,
          place_id: placeId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menghapus dari wishlist.");
        return;
      }

      // Update UI tanpa reload
      setWishlist((prev) => prev.filter((item) => item.place_id !== placeId));
      onToggleFavorite && onToggleFavorite(placeId);
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    }
  };

  // ================================
  // UI STATES
  // ================================
  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500">
        <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Memuat wishlist...
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <div className="py-10">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-3xl font-extrabold">
          ❤️ Wishlist Kamu{" "}
          <span className="ml-2 text-gray-400 text-base font-medium">
            ({wishlist.length})
          </span>
        </h2>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-lg font-medium">Wishlist kamu kosong.</p>
          <p className="text-gray-400">
            Tambah restoran favorit agar mudah kamu temukan lagi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => {
            const place = item.places || {};
            const placeId = item.place_id ?? place.id;

            const isFav = favorites?.includes?.(placeId);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow border hover:shadow-xl transition overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={place.photos?.[0] || place.image_url || "/placeholder.jpg"}
                    alt={place.name || "Restoran"}
                    className="h-44 w-full object-cover"
                  />

                  {/* Fav badge kecil */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => onToggleFavorite && onToggleFavorite(placeId)}
                      className={`w-9 h-9 rounded-full shadow flex items-center justify-center text-lg transition ${
                        isFav ? "bg-rose-600 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                      }`}
                      title={isFav ? "Hapus dari favorit" : "Tambah ke favorit"}
                    >
                      {isFav ? "♥" : "♡"}
                    </button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="text-lg font-bold">
                    {place.name || "Nama restoran"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {place.city_name || place.city || "Kota tidak diketahui"}
                  </p>

                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={() => handleRemove(placeId)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      Hapus
                    </button>

                    <button
                      onClick={() => onViewDetail && onViewDetail(place)} // ✅ INI KUNCINYA
                      className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-sm font-semibold"
                    >
                      Lihat Detail →
                    </button>
                  </div>

                  {!onViewDetail && (
                    <p className="text-[11px] text-amber-600 mt-3">
                      ⚠️ onViewDetail belum dikirim dari App.jsx
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
