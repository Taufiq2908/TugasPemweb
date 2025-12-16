import React, { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const WishlistProvider = ({ children, user }) => {
  // Kita simpan ID restoran dalam Set (biar pencarian cepat)
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // 1. Ambil data wishlist saat User Login
  useEffect(() => {
    if (user?.id) {
      fetchWishlist();
    } else {
      setWishlistIds(new Set()); // Reset jika logout
    }
  }, [user]);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("makanKi_token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        // Ambil place_id saja dan masukkan ke Set
        // Asumsi data backend: [{ id: 1, place_id: 5, ... }, ...]
        const ids = new Set(data.map(item => item.place_id));
        setWishlistIds(ids);
      }
    } catch (err) {
      console.error("Gagal load wishlist global:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Toggle Global
  const toggleWishlistGlobal = async (placeId) => {
    const token = localStorage.getItem("makanKi_token");
    if (!token || !user) return { success: false, message: "Login dulu" };

    const isCurrentlySaved = wishlistIds.has(placeId);
    
    // OPTIMISTIC UPDATE (Ubah UI duluan)
    const newSet = new Set(wishlistIds);
    if (isCurrentlySaved) {
      newSet.delete(placeId);
    } else {
      newSet.add(placeId);
    }
    setWishlistIds(newSet);

    try {
      const method = isCurrentlySaved ? "DELETE" : "POST";
      const res = await fetch(`${API_BASE}/wishlist`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.id, place_id: placeId })
      });

      if (!res.ok) throw new Error("Gagal sync server");
      return { success: true };
    } catch (err) {
      // Revert jika gagal
      console.error(err);
      fetchWishlist(); // Sync ulang
      return { success: false };
    }
  };

  // Helper untuk cek status
  const isWishlisted = (placeId) => wishlistIds.has(placeId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlistGlobal, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};