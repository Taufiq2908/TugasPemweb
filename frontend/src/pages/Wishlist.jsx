import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Wishlist = ({
  user,
  favorites = [],
  onToggleFavorite,
  onViewDetail,
  token
}) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // HELPER: FIX KOTA TIDAK DIKETAHUI
  // ================================
  const getPlaceLocation = (place) => {
    if (!place) return "Lokasi tidak tersedia";
    
    // Cek berbagai kemungkinan nama field dari database
    if (place.city) return place.city;
    if (place.city_name) return place.city_name;
    if (place.kabupaten) return place.kabupaten;
    if (place.address) return place.address; // Fallback ke alamat jika kota null
    
    return "Indonesia"; // Fallback terakhir agar tidak jelek
  };

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

    // Optimistic UI Update (Hapus dulu dari layar biar cepat)
    const oldWishlist = [...wishlist];
    setWishlist((prev) => prev.filter((item) => (item.place_id || item.places?.id) !== placeId));
    onToggleFavorite && onToggleFavorite(placeId);

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

      if (!res.ok) {
        // Revert jika gagal
        setWishlist(oldWishlist);
        onToggleFavorite && onToggleFavorite(placeId); // Toggle balik
        alert("Gagal menghapus dari wishlist.");
      }
    } catch (err) {
      setWishlist(oldWishlist);
      console.error(err);
    }
  };

  // ================================
  // UI STATES
  // ================================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan daftar keinginan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-xl font-bold text-gray-800">Terjadi Kesalahan</h3>
        <p className="text-red-500 mt-2">{error}</p>
        <button onClick={fetchWishlist} className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-8 px-4 sm:px-6 sticky top-0 z-10 shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Wishlist
              <span className="text-rose-500">.</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Daftar restoran impian yang ingin kamu kunjungi.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 self-start md:self-auto">
            <span className="text-rose-500 font-bold text-lg">❤️</span>
            <span className="text-rose-900 font-bold">{wishlist.length}</span>
            <span className="text-rose-700 text-sm font-medium">Disimpan</span>
          </div>
        </div>
      </div>

      {/* 2. CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {wishlist.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6 relative">
              <span className="text-7xl opacity-50 grayscale">🍱</span>
              <div className="absolute top-0 right-0 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-2xl">
                💔
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Wishlist Masih Kosong</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Jangan biarkan perutmu penasaran. Mulai jelajahi restoran dan simpan yang menarik di sini!
            </p>
            {/* Tombol akan diarahkan user manual via navbar */}
          </div>
        ) : (
          // --- CARD GRID ---
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const place = item.places || {};
              const placeId = item.place_id ?? place.id;
              
              // Handle Bug Kota
              const locationName = getPlaceLocation(place);

              return (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full"
                >
                  
                  {/* IMAGE SECTION */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={place.photos?.[0] || place.image_url || "/placeholder.jpg"}
                      alt={place.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay for Text Visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Floating Action Button (Delete) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(placeId);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-all z-20 group-hover:scale-100 scale-90"
                      title="Hapus dari Wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {/* X Overlay when hovering delete */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-white rounded-full transition-opacity">
                         ❌
                      </div>
                    </button>
                    
                    {/* Badge Kota (Over Image) */}
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        📍 {locationName}
                      </p>
                    </div>
                  </div>

                  {/* CONTENT SECTION */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {place.name || "Nama Restoran"}
                      </h3>
                      
                      {/* Rating Placeholder */}
                      <div className="flex items-center gap-1 mb-4">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className="text-yellow-400 text-sm">★</span>
                        ))}
                        <span className="text-xs text-gray-400 ml-1">(4.8)</span>
                      </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-4 border-t border-gray-50 mt-2">
                      <button
                        onClick={() => onViewDetail && onViewDetail(place)}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-gray-200 group-hover:bg-rose-600 group-hover:shadow-rose-200 transition-all flex items-center justify-center gap-2"
                      >
                        Lihat Detail 
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                      
                      {!onViewDetail && (
                        <p className="text-[10px] text-red-500 text-center mt-2">
                          ⚠️ Error: Navigasi detail belum terhubung
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};