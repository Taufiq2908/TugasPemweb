// frontend/pages/Wishlist.jsx
import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Wishlist = ({ user }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // 1. LOAD WISHLIST USER
  // ================================
  const fetchWishlist = async () => {
    if (!user?.id) {
      setLoading(false); // supaya tidak loading terus
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/wishlist/${user.id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memuat wishlist.");
        setLoading(false);
        return;
      }

      // Backend mengembalikan:
      // [{ id, place_id, places: {...placeData} }]
      setWishlist(data);
    } catch (err) {
      console.error(err);
      setError("Kesalahan koneksi.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  // ================================
  // 2. REMOVE FROM WISHLIST
  // ================================
  const handleRemove = async (placeId) => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
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

    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Memuat wishlist...
      </div>
    );
  }

  // Error State
  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold mb-6">
        Wishlist Kamu ({wishlist.length})
      </h2>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-lg font-medium">Wishlist kamu kosong.</p>
          <p className="text-gray-400">Tambah restoran ke wishlist untuk melihatnya di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const place = item.places; // data restoran

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition"
              >
                {/* GAMBAR */}
                <img
                  src={(place.photos?.[0]) || "/placeholder.jpg"}
                  alt={place.name}
                  className="h-40 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="text-lg font-semibold">{place.name}</h3>
                  <p className="text-gray-500 text-sm">{place.city}</p>

                  <div className="flex justify-between mt-4">
                    <button
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                      onClick={() => handleRemove(place.id)}
                    >
                      Hapus
                    </button>

                    <a
                      href={`/detail/${place.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Lihat Detail
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
