// src/App.jsx
import React, { useState, useMemo, useEffect } from "react";

import { RestaurantCard } from "./components/RestaurantCard";
import { LoginForm, RegisterForm } from "./components/Auth";
import { VerifyEmail } from "./pages/VerifyEmail";
// IMPORT DARI FOLDER PAGES
import { Profile } from "./pages/Profile";
import { PublicProfile } from "./pages/PublicProfile";
import { Wishlist } from "./pages/Wishlist";
import { RestaurantDetail } from "./pages/RestaurantDetail";
import { SearchPage } from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import AdminRestaurantDetail from "./pages/AdminRestaurantDetail";
import AdminAddRestaurant from "./pages/AdminAddRestaurant";
import OwnerPage from "./pages/OwnerPage";
import OwnerRestaurantDetail from "./pages/OwnerRestaurantDetail";
import HomeRestaurantMap from "./components/HomeRestaurantMap";
import RegisterOwner from "./pages/RegisterOwner";




import { CITY_MAP } from "./constant/cities";

import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// map data backend → shape RestaurantCard
const mapPlaceFromApi = (p) => ({
  id: p.id,
  name: p.name,
  city: CITY_MAP[p.city_id]?.name || "Tidak diketahui",
  location: p.address || "",
  rating: p.average_rating || 0,
  reviews: p.total_reviews || 0,
  description: p.description || "",

  // 🔥 langsung pakai nilai database
  priceRange: p.price_range || "-",
  openHours: p.opening_hours || "Jam tidak tersedia",

  coverImage:
    p.photos?.[0] ||
    "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg",
  lat: p.lat,
  lon: p.lon,
});


const FAVORITE_CATEGORIES = [
  { key: "local", label: "Makanan Daerah" },
  { key: "meat", label: "Daging" },
  { key: "noodle", label: "Mie" },
  { key: "seafood", label: "Seafood" },
  { key: "drink", label: "Minuman & Kopi" },
  { key: "dessert", label: "Dessert & Buah" },
];

const CATEGORY_KEYWORDS = {
  local: ["coto", "konro", "sop saudara", "soto", "nasi", "warung"],
  meat: ["daging", "sapi", "ayam", "kambing", "iga", "steak", "konro"],
  noodle: ["mie", "bakmi", "ramen", "udon", "kwetiau"],
  seafood: ["seafood", "ikan", "udang", "kepiting", "kerang"],
  drink: ["kopi", "coffee", "minuman", "tea", "teh", "boba", "milk", "jus", "juice"],
  dessert: ["dessert", "es krim", "ice cream", "cake", "kue", "puding", "buah"],
};

function App() {
  // ==========================
  // AUTH & NAVIGATION
  // ==========================
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("makanKi_token") || ""
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === "/verify-email") {
      return "verify-email";
    }
    return "home";
  });
  const [selectedAdminRestaurantId, setSelectedAdminRestaurantId] = useState(null);
  const [selectedOwnerRestaurantId, setSelectedOwnerRestaurantId] = useState(null);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // <== OBJECT restoran
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ==========================
  // HOMEPAGE – LOKASI & KOTA
  // ==========================
  const [cityList, setCityList] = useState(Object.values(CITY_MAP));
  const [selectedUserId, setSelectedUserId] = useState(null);


  const [selectedCityId, setSelectedCityId] = useState(null); // untuk filter homepage
  const [userCityId, setUserCityId] = useState(null); // kota hasil deteksi lokasi pertama
  const [currentCityName, setCurrentCityName] = useState("Semua Kota");

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [cityModalValue, setCityModalValue] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // ==========================
  // HOMEPAGE – DATA RESTO & UI
  // ==========================
  const [apiRestaurants, setApiRestaurants] = useState([]); // data dari /places/city/:id
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'map'
  const [activeCategoryKey, setActiveCategoryKey] = useState(null); // kategori populer
  const [cityMapUrl, setCityMapUrl] = useState("");
  const [homeSearchQuery, setHomeSearchQuery] = useState("");

  // wishlist
  const [favorites, setFavorites] = useState([]);


  // ==========================
  // POPUP IZIN LOKASI (VERSI LAMA)
  // ==========================
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | success | error

  // ==========================
  // DETEKSI LOKASI
  // ==========================
  const detectLocationAndSetCity = () => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation tidak didukung browser.");
      setLocationStatus("error");
      setIsCityModalOpen(true);
      return;
    }

    setLocationStatus("loading");
    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        localStorage.setItem("userLat", String(latitude));
        localStorage.setItem("userLng", String(longitude));

        try {
          const res = await fetch(
            `${API_BASE}/cities/detect?lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          if (res.ok && (data.cityId || data.city?.id)) {
            const cityId = String(data.cityId || data.city.id);
            const cityName = data.cityName || data.city?.name;

            const city = cityList.find((c) => String(c.id) === cityId) || null;

            setUserCityId(cityId);
            setSelectedCityId(cityId);

            localStorage.setItem("makanKi_userCityId", cityId);
            localStorage.setItem("makanKi_selectedCityId", cityId);

            setCurrentCityName(city?.name || cityName || "Kota Anda");
            setLocationStatus("success");
          }
          else {
            console.warn("Kota tidak terdaftar di sistem.");
            setLocationStatus("error");
            setIsCityModalOpen(true);
          }
        } catch (err) {
          console.error("Gagal cek kota:", err);
          setLocationStatus("error");
          setIsCityModalOpen(true);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn("User menolak / gagal memberi izin lokasi:", err);
        setLocationStatus("error");
        setIsDetectingLocation(false);
        setIsCityModalOpen(true);
      }
    );
  };

  // ==========================
  // FUNGSI: AMBIL RESTO PER KOTA
  // ==========================
  const fetchRestaurantsByCity = async (cityId) => {
    if (!cityId) {
      setApiRestaurants([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/places/city/${cityId}`);
      const data = await res.json();

      if (res.ok) {
        const list = (data.data || data.places || data || []).map(mapPlaceFromApi);
        setApiRestaurants(list);
      } else {
        console.error("Gagal ambil tempat dari API.");
        setApiRestaurants([]);
      }
    } catch (err) {
      console.error("Error fetchRestaurantsByCity:", err);
      setApiRestaurants([]);
    }
  };

  // ==========================
  // FUNGSI: AMBIL MAP PER KOTA
  // ==========================
  const fetchCityMap = async (cityId) => {
    if (!cityId) {
      setCityMapUrl("");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/maps/places?city_id=${cityId}`);
      const data = await res.json();
      if (res.ok) {
        setCityMapUrl(data.mapUrl || data.embedUrl || "");
      } else {
        setCityMapUrl("");
      }
    } catch (err) {
      console.error("Error fetchCityMap:", err);
      setCityMapUrl("");
    }
  };


  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Kirim token
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Token valid, set data user ke state agar UI berubah jadi Login
          setUser(data.user);
        } else {
          // Token expired atau tidak valid
          handleLogout(); 
        }
      } catch (err) {
        console.error("Gagal verifikasi token:", err);
        handleLogout();
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    // 1. Cek apakah ada permintaan paksa lokasi (dari VerifyEmail)
    const askLocationFlag = localStorage.getItem("makanKi_askLocation");
    
    // 2. Cek apakah kota sudah dipilih sebelumnya
    const savedCity = localStorage.getItem("makanKi_selectedCityId");

    if (askLocationFlag === "true") {
      // Paksa munculkan popup
      setShowLocationModal(true);
      // Hapus flag agar tidak muncul terus menerus saat refresh
      localStorage.removeItem("makanKi_askLocation");
    } 
    else if (savedCity) {
      // Jika sudah ada kota tersimpan, load data kotanya
      setSelectedCityId(savedCity);
    } 
    else {
      // Jika belum ada kota sama sekali (User baru buka web), munculkan popup
      setShowLocationModal(true);
    }
  }, []);


  // ==========================
  // USE EFFECT: INIT
  // ==========================
  useEffect(() => {
    const saved = localStorage.getItem("makanKi_selectedCityId");
    if (saved) {
      setSelectedCityId(saved);
    } else {
      setShowLocationModal(true);
    }
  }, []);

  // ketika selectedCityId berubah → load data kota
  useEffect(() => {
    if (!selectedCityId) return;

    const city = cityList.find((c) => String(c.id) === String(selectedCityId));
    if (city) {
      setCurrentCityName(city.name);
    }

    fetchRestaurantsByCity(selectedCityId);
    fetchCityMap(selectedCityId);
    // reset kategori ketika ganti kota
    setActiveCategoryKey(null);
  }, [selectedCityId, cityList]);

  // ==========================
  // HANDLER POPUP LOKASI
  // ==========================
  const handleAllowLocation = () => {
    setShowLocationModal(false);
    detectLocationAndSetCity();
  };

  const handleDenyLocation = () => {
    setShowLocationModal(false);
    setIsCityModalOpen(true); // langsung ke pilih kota manual
  };

  // ==========================
  // HANDLER PILIH KOTA MANUAL
  // ==========================
  const handleConfirmCityManual = () => {
    if (!cityModalValue) return;
    setSelectedCityId(cityModalValue);

    const city = cityList.find((c) => String(c.id) === String(cityModalValue));
    setCurrentCityName(city?.name || "Kota Anda");

    if (!userCityId) {
      setUserCityId(cityModalValue);
      localStorage.setItem("makanKi_userCityId", String(cityModalValue));
    }

    localStorage.setItem("makanKi_selectedCityId", String(cityModalValue));
    setIsCityModalOpen(false);
  };

  const handleCityTabClick = (cityId) => {
    setSelectedCityId(String(cityId));
    localStorage.setItem("makanKi_selectedCityId", String(cityId));
    setActiveCategoryKey(null);
  };

  // ==========================
  // KATEGORI POPULER (HOME)
  // ==========================
  const handleCategoryClick = (key) => {
    setActiveCategoryKey((prev) => (prev === key ? null : key));
  };

  const filteredHomeRestaurants = useMemo(() => {
    let baseList = [...apiRestaurants];

    if (activeCategoryKey) {
      const words = CATEGORY_KEYWORDS[activeCategoryKey] || [];
      if (words.length) {
        baseList = baseList.filter((r) => {
          const text = `${r.name} ${r.description || ""}`.toLowerCase();
          return words.some((w) => text.includes(w));
        });
      }
    }

    return baseList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [apiRestaurants, activeCategoryKey]);

  // ==========================
  // WISHLIST / FAVORITE (GLOBAL)
  // ==========================
  const toggleFavorite = async (placeId) => {
    if (!user || !token) {
      alert("Silakan login untuk menambah ke wishlist.");
      return;
    }

    const isFav = favorites.includes(placeId);
    const method = isFav ? "DELETE" : "POST";

    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,   // sekarang aman, karena user pasti ada
          place_id: placeId,
        }),
      });

      if (!res.ok) {
        console.error("Gagal mengubah wishlist di server.");
        return;
      }

      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== placeId) : [...prev, placeId]
      );
    } catch (err) {
      console.error("Error toggle wishlist:", err);
    }
  };


  // ==========================
  // HANDLER AUTH
  // ==========================
  const handleLogin = (userData) => {

    // reset kota agar user harus set lokasi lagi
    localStorage.removeItem("makanKi_selectedCityId");
    localStorage.removeItem("makanKi_userCityId");
    localStorage.removeItem("userLat");
    localStorage.removeItem("userLng");

    setShowLocationModal(true);   // popup muncul lagi

    const fullUserData = {
      ...userData,
      city: userData.city || "Belum Diatur",
      totalUpvotes: userData.totalUpvotes || 0,
      avatarUrl: userData.avatarUrl || undefined,
    };

    setUser(fullUserData);
    setToken(localStorage.getItem("makanKi_token") || "");

    if (userData.role === "admin") {
      setCurrentPage("admin");
    } else {
      setCurrentPage("home");
    }

  };


  const handleLogout = () => {
    setUser(null);
    setToken("");

    // Hapus token
    localStorage.removeItem("makanKi_token");

    // RESET lokasi
    localStorage.removeItem("makanKi_selectedCityId");
    localStorage.removeItem("makanKi_userCityId");
    localStorage.removeItem("userLat");
    localStorage.removeItem("userLng");

    // Paksa popup muncul lagi
    setShowLocationModal(true);

    setCurrentPage("home");
  };


  const handleUpdateUser = (updatedUser) => {
    setUser(prev => ({
      ...prev,
      ...updatedUser
    }));
  };

  // ==========================
  // HANDLER NAVIGASI
  // ==========================
  const handleRestaurantClick = (restaurantObj) => {
    // ⬅️ PENTING: simpan OBJECT, bukan ID
    setSelectedRestaurant(restaurantObj);
    setCurrentPage("detail");
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const handleUserClick = (userId) => {
    // 🛑 VALIDASI KETAT (anti [object Object])
    if (typeof userId !== "string" && typeof userId !== "number") {
      console.error("Invalid userId:", userId);
      return;
    }

    // Kalau klik diri sendiri → profile pribadi
    if (user && String(user.id) === String(userId)) {
      setCurrentPage("profile");
    } else {
      // Profile publik SELALU pakai ID
      setSelectedUserId(userId);
      setCurrentPage("public-profile");
    }

    window.scrollTo(0, 0);
  };



  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  // ==========================
  // SEARCH DI HOMEPAGE
  // ==========================
  const handleHomeSearchSubmit = (e) => {
    e.preventDefault();
    // Langsung pindah halaman, state 'homeSearchQuery' akan kita kirim lewat props
    setCurrentPage("search");
    window.scrollTo(0, 0);
  };

  // ==========================
  // RENDER MAIN CONTENT
  // ==========================
  const renderContent = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginForm
            onLogin={handleLogin}
            onSwitchMode={() => setCurrentPage("register")}
          />
        );

      case "register":
        return (
          <RegisterForm
            onLogin={handleLogin}
            onSwitchMode={() => setCurrentPage("login")}
          />
        );

      case "verify-email":
        return <VerifyEmail />;

      case "admin":
        if (!user || user.role !== "admin") {
          return null; // ⬅️ JANGAN setState di sini
        }

        return (
          <AdminPage
            user={user}
            token={token}
            onAdd={() => setCurrentPage("admin-add")}
            onOpenDetail={(id) => {
              setSelectedAdminRestaurantId(id);
              setCurrentPage("admin-detail");
            }}
          />
        );

      case "admin-detail":
        if (!selectedAdminRestaurantId) return null;

        return (
          <AdminRestaurantDetail
            restaurantId={selectedAdminRestaurantId}
            onBack={() => setCurrentPage("admin")}
          />
        );

      case "admin-add":
        return (
          <AdminAddRestaurant
            token={token}
            onBack={() => setCurrentPage("admin")}
          />
        );

      
      case "owner":
        if (!user || user.role !== "owner") {
          setCurrentPage("home");
          return null;
        }
        return (
          <OwnerPage
            user={user}
            token={token}
            onOpenDetail={(id) => {
              setSelectedOwnerRestaurantId(id);
              setCurrentPage("owner-detail");
            }}
          />
        );

      case "owner-detail":
        if (!user || user.role !== "owner" || !selectedOwnerRestaurantId) {
          setCurrentPage("home");
          return null;
        }
        return (
          <OwnerRestaurantDetail
            restaurantId={selectedOwnerRestaurantId}
            token={token}
            onBack={() => setCurrentPage("owner")}
          />
        );

      case "register-owner":
        return (
          <RegisterOwner
            user={user}
            token={token}
            onBack={() => setCurrentPage("profile")}
            onSuccess={(updatedUser) => {
              setUser(updatedUser);
              setCurrentPage("profile");
            }}
          />
        );




      case "profile":
        if (!user) {
          setCurrentPage("login");
          return null;
        }
        return (
          <Profile
            user={user}
            reviews={[]}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            onNavigate={navigateTo}
            token={token}
          />

        );

      case "public-profile":
        if (!selectedUserId) return null;
        return (
          <PublicProfile
            userId={selectedUserId}
            onBack={() => setCurrentPage("detail")}
          />
        );


      case "wishlist":
        return (
          <Wishlist
            user={user}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onViewDetail={handleRestaurantClick}
            token={token}
          />
        );

      case "search":
        return (
          <SearchPage
            // Kirim query dari home ke search page
            initialQuery={homeSearchQuery} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onViewDetail={handleRestaurantClick}
          />
        );

      case "detail":
        if (!selectedRestaurant) return null;
        return (
          <RestaurantDetail
            restaurant={selectedRestaurant} // OBJECT, bukan ID
            isFavorite={favorites.includes(selectedRestaurant.id)}
            onToggleFavorite={toggleFavorite}
            onBack={() => setCurrentPage("home")}
            onUserClick={handleUserClick}
            user={user}
            onAuthRequest={() => navigateTo("login")}
          />
        );

      case "home":
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="relative bg-rose-600 text-white overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "url('https://www.transparenttextures.com/patterns/food.png')",
                }}
              ></div>
              <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Jelajahi Rasa Nusantara
                </h2>
                <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
                  Temukan kuliner terbaik di berbagai kota hanya dengan satu
                  klik.
                </p>

                {/* Search bar (bisa diketik) */}
                <form
                  onSubmit={handleHomeSearchSubmit}
                  className="max-w-2xl mx-auto bg-white rounded-full p-2 shadow-2xl flex items-center transform transition-all hover:scale-[1.02] duration-300 ring-4 ring-rose-500/30"
                >
                  <div className="grow pl-6 pr-4 py-3 text-left">
                    <input
                      type="text"
                      className="w-full border-none outline-none text-gray-800 placeholder-gray-400 text-sm md:text-base bg-transparent"
                      placeholder="Cari Coto, Sate, Kopi, atau kuliner lain..."
                      value={homeSearchQuery}
                      onChange={(e) => setHomeSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition shadow-md flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Cari
                  </button>
                </form>
                <p className="mt-4 text-rose-200 text-sm">
                  Setelah klik tombol <b>Cari</b>, kamu akan diarahkan ke halaman
                  pencarian lengkap.
                </p>
              </div>
            </div>

            {/* Tabs Kota */}
            <div className="flex overflow-x-auto pb-4 gap-2 mb-6 scrollbar-hide">
              {cityList.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCityTabClick(city.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    String(selectedCityId || userCityId) === String(city.id)
                      ? "bg-rose-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>

            {/* Kategori Populer */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Kategori Populer
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {FAVORITE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`bg-white rounded-xl border text-xs sm:text-sm py-3 px-2 text-center font-medium shadow-sm hover:bg-gray-50 transition ${
                      activeCategoryKey === cat.key
                        ? "border-rose-500 text-rose-600"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ==============================
                Toolbar: Judul + Toggle View
            ================================ */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Rekomendasi Terpopuler
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredHomeRestaurants.length} tempat di {currentCityName})
                </span>
              </h2>

              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                {/* GRID */}
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-gray-100 text-rose-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Tampilan Grid"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>

                {/* MAP */}
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 rounded ${
                    viewMode === "map"
                      ? "bg-gray-100 text-rose-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Tampilan Peta"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* ==============================
                GRID / MAP CONTENT
            ================================ */}
            {viewMode === "grid" ? (
              /* ================= GRID ================= */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredHomeRestaurants.length > 0 ? (
                  filteredHomeRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      data={restaurant}
                      isFavorite={favorites.includes(restaurant.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={handleRestaurantClick}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Tidak ada restoran ditemukan
                    </h3>
                    <p className="text-gray-500">
                      Belum ada data untuk kota ini.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* ================= MAP ================= */
              <div className="w-full h-[600px] rounded-xl overflow-hidden border">
                {filteredHomeRestaurants.filter(r => r.lat && r.lon).length > 0 ? (
                  <HomeRestaurantMap
                    restaurants={filteredHomeRestaurants.filter(r => r.lat && r.lon)}
                    center={{
                      lat: Number(filteredHomeRestaurants.find(r => r.lat)?.lat) || -5.147665,
                      lng: Number(filteredHomeRestaurants.find(r => r.lon)?.lon) || 119.432732
                    }}
                    onSelect={handleRestaurantClick}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Tidak ada lokasi restoran untuk ditampilkan di peta.
                  </div>
                )}
              </div>
            )}

          </>
        );
    }
  };

  // ==========================
  // RENDER UTAMA
  // ==========================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Pop Up Izin Lokasi (custom) */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100">
            <div className="mb-4 flex justify-center">
              {locationStatus === "loading" ? (
                <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
              ) : (
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-3xl">
                  🗺️
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aktifkan Lokasi?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Izinkan kami mengakses lokasi Anda untuk memberikan rekomendasi
              restoran terdekat dan peta yang lebih akurat.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleDenyLocation}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition text-sm"
              >
                Nanti Saja
              </button>
              <button
                onClick={handleAllowLocation}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/30 transition text-sm"
              >
                Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pilih kota manual */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Pilih Kota
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Kami tidak dapat mendeteksi kota Anda. Silakan pilih salah satu
              kota yang tersedia untuk menampilkan rekomendasi restoran.
            </p>
            <select
              value={cityModalValue}
              onChange={(e) => setCityModalValue(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
            >
              <option value="">-- Pilih Kota --</option>
              {cityList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleConfirmCityManual}
              disabled={!cityModalValue}
              className="w-full bg-rose-600 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-semibold hover:bg-rose-700"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => {
                setCurrentPage("home");
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🍛</span>
              <h1 className="text-2xl font-extrabold text-rose-600 tracking-tight">
                Makan Ki'
              </h1>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <button
                onClick={() => setCurrentPage("home")}
                className={`hover:text-rose-500 transition-colors ${
                  currentPage === "home" ? "text-rose-600 font-bold" : ""
                }`}
              >
                Beranda
              </button>

              <button
                onClick={() => setCurrentPage("wishlist")}
                className={`hover:text-rose-500 transition-colors ${
                  currentPage === "wishlist" ? "text-rose-600 font-bold" : ""
                }`}
              >
                Wishlist ({favorites.length})
              </button>

              <div className="h-6 w-px bg-gray-300 mx-2" />

              {user ? (
                <button
                  onClick={() => setCurrentPage("profile")}
                  className="flex items-center gap-2 text-gray-800 hover:text-rose-600 transition-colors"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name
                      )}&background=e11d48&color=fff`
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                  />
                  <span>{user.name}</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage("login")}
                    className="text-gray-600 hover:text-rose-600 transition-colors"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => setCurrentPage("register")}
                    className="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition-shadow shadow-md shadow-rose-500/20"
                  >
                    Daftar
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 z-40 animate-fade-in">
            <div className="flex flex-col">
              {/* Auth area */}
              {user ? (
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&background=e11d48&color=fff`
                      }
                      alt="Avatar"
                      className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                    />
                    <div className="overflow-hidden">
                      <span className="block font-bold text-gray-900 text-lg truncate">
                        {user.name}
                      </span>
                      <span className="block text-sm text-gray-500 truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage("profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center shadow-sm"
                  >
                    Lihat Profil
                  </button>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-100 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCurrentPage("login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("register");
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2.5 bg-rose-600 text-white rounded-lg font-bold shadow-sm hover:bg-rose-700"
                  >
                    Daftar
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setCurrentPage("home");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    currentPage === "home"
                      ? "bg-rose-50 text-rose-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Beranda
                </button>

                <button
                  onClick={() => {
                    setCurrentPage("wishlist");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    currentPage === "wishlist"
                      ? "bg-rose-50 text-rose-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Wishlist ({favorites.length})
                </button>
              </div>

              {user && (
                <div className="p-2 border-t border-gray-100 mt-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <span>🍛</span> Makan Ki'
            </h3>
            <p className="text-sm">
              Platform pencarian kuliner terpercaya di Indonesia. Temukan rasa autentik nusantara.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Kota</h4>
            <ul className="space-y-2 text-sm">
              {cityList.slice(0, 10).map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Tim Pengembang</h4>
            <ul className="space-y-2 text-sm">
              <li>Muh Ilham Yusal</li>
              <li>Taufiqurrahman Hendra</li>
              <li>Giri Kencana Jati</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          © 2025 Makan Ki'
        </div>
      </footer>
    </div>
  );
}

export default App;
