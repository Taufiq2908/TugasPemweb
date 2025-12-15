// frontend/src/pages/SearchPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RestaurantCard } from '../components/RestaurantCard';

// Base URL API
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SearchPage = ({
  initialQuery = '', // 1. Terima props initialQuery (default kosong)
  restaurants = [],
  favorites = [],
  onToggleFavorite,
  onViewDetail
}) => {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState('auto'); // Default auto
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');

  // Results State
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

  // Mobile UI State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  // --- 1. FETCH DATA UTAMA (Kategori & Kota) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const catRes = await fetch(`${API_BASE}/categories`);
        const catData = await catRes.json();
        if (catRes.ok) {
          setCategories(catData.filter(c => c.is_display));
        }

        // Fetch Cities
        const cityRes = await fetch(`${API_BASE}/cities`);
        const cityData = await cityRes.json();
        if (cityRes.ok) {
          // Normalisasi ID menjadi string agar aman di select option
          const normalizedCities = (cityData.data || cityData).map(c => ({
            ...c,
            id: String(c.id)
          }));
          setCities(normalizedCities);
        }
      } catch (err) {
        console.error("Init fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // --- 2. HELPER: Parsing Foto dari CSV/JSON ---
  const getCoverImage = (place) => {
    // 1. Cek jika sudah ada field cover_image_url
    if (place.cover_image_url) return place.cover_image_url;

    // 2. Cek kolom 'photos'
    if (place.photos) {
      // Jika photos adalah Array (JSONB di Supabase)
      if (Array.isArray(place.photos) && place.photos.length > 0) {
        return place.photos[0];
      }
      
      // Jika photos adalah String (CSV issue atau Text column)
      if (typeof place.photos === 'string') {
        try {
          // Bersihkan format CSV yang aneh: ["url"] atau "[\"url\"]"
          let cleanStr = place.photos;
          // Hapus escape characters berlebih jika ada
          if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
             cleanStr = cleanStr.slice(1, -1);
          }
          cleanStr = cleanStr.replace(/\\"/g, '"'); // Unescape quote
          
          const parsed = JSON.parse(cleanStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch (e) {
          console.warn("Photo parse failed, trying raw string logic", e);
        }
      }
    }
    // Default Fallback
    return 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg';
  };

  // --- 3. MAPPING DATA ---
  const mapPlaceToCard = (place) => {
    return {
      id: place.id,
      name: place.name,
      // Handle relasi cities(name) dari backend
      city: place.cities?.name || place.city_name || 'Kota tidak diketahui', 
      location: place.address || '',
      rating: place.average_rating || 0,
      reviews: place.total_reviews || 0,
      description: place.description || '',
      priceRange: place.price_range_label || 'Sedang', // Bisa disesuaikan logikanya
      coverImage: getCoverImage(place),
      distanceKm: place.distance_km || null,
      categoryId: null, // Kita tidak butuh ini lagi untuk filter frontend
      raw: place
    };
  };

  // --- 4. ENGINE PENCARIAN (Backend Only) ---
  const runSearch = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setHasSearchedOnce(true);

    try {
      const params = new URLSearchParams();
      const qTrimmed = searchQuery.trim();
      const userLat = localStorage.getItem('userLat');
      const userLng = localStorage.getItem('userLng');
      const userCityId = localStorage.getItem('cityId');

      // A. Setup Parameter Query
      if (qTrimmed) params.append('q', qTrimmed);

      // B. Setup City Logic & Radius
      if (selectedCityId === 'auto') {
        if (userCityId) {
          // Prioritas 1: Auto + Ada ID Kota di LocalStorage -> Filter Kota Ketat
          params.append('city_id', userCityId);
        } else if (userLat && userLng) {
          // Prioritas 2: Auto + Tidak ada ID Kota + Ada LatLon -> Filter Radius (Nearby)
          // [PERBAIKAN] Tambahkan radius agar tidak menampilkan seluruh dunia
          params.append('radius', '30'); // Cari dalam radius 30km
        } else {
          // Prioritas 3: Tidak ada info sama sekali -> Nanti akan kena validasi 400 backend
        }
      } else if (selectedCityId !== 'all') {
        // User pilih kota spesifik
        params.append('city_id', selectedCityId);
      }
      // Jika 'all', kita tidak kirim city_id (Global Search)

      // C. Setup Location Params
      if (userLat && userLng) {
        params.append('lat', userLat);
        params.append('lon', userLng);
      }

      // D. Setup Filter Lain
      if (selectedCategoryId !== 'all') {
        params.append('category_id', selectedCategoryId);
      }
      if (minRating > 0) {
        params.append('rating_min', minRating);
      }
      if (sortBy !== 'relevance') {
        params.append('sort', sortBy);
      }

      // E. Request
      const url = `${API_BASE}/search/search?${params.toString()}`;
      // console.log("Fetching:", url); 

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        // Tangani 400 (Bad Request) dengan pesan yang lebih ramah
        if (res.status === 400) {
          throw new Error("Mohon izinkan akses lokasi atau pilih kota terlebih dahulu untuk memulai.");
        }
        throw new Error(data.error || "Gagal mengambil data pencarian");
      }

      // F. Mapping Result
      const searchResults = (data.data || []).map(mapPlaceToCard);
      setResults(searchResults);

    } catch (err) {
      console.error(err);
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategoryId, selectedCityId, minRating, sortBy]);

  // --- 5. AUTO SEARCH EFFECT ---
  // Trigger search saat filter berubah, TAPI debounce sedikit
  useEffect(() => {
    // Hanya auto search jika user sudah pernah berinteraksi atau membuka halaman
    const timer = setTimeout(() => {
      runSearch();
    }, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [selectedCategoryId, selectedCityId, minRating, sortBy, runSearch]); 

  // --- HANDLERS ---
  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const userCityName = localStorage.getItem('cityName') || 'Lokasi Saya';

  return (
    <div className="py-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Pencarian Kuliner</h1>
          <p className="text-gray-600 mt-2">Temukan makanan favoritmu di {selectedCityId === 'auto' ? userCityName : 'kota pilihan'}.</p>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Mau makan apa hari ini? (Contoh: Coto, Bakso, Seafood)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition"
            >
              Cari
            </button>
          </div>
        </form>

        {/* MOBILE CONTROLS */}
        <div className="md:hidden flex gap-2 mb-4">
          <button onClick={() => setIsMobileFilterOpen(true)} className="flex-1 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50">
            Filter
          </button>
          <button onClick={() => setIsMobileSortOpen(true)} className="flex-1 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50">
            Urutkan
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* SIDEBAR FILTER (DESKTOP) */}
          <aside className="hidden md:block w-64 space-y-6">
            
            {/* Filter Kota */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <h3 className="font-semibold mb-3">📍 Kota</h3>
              <select 
                className="w-full p-2 border rounded-lg text-sm bg-white"
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
              >
                <option value="auto">📍 Otomatis ({userCityName})</option>
                <option value="all">🌐 Semua Kota</option>
                <option disabled>──────────</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <h3 className="font-semibold mb-3">🍱 Kategori</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategoryId === 'all' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Semua
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(String(cat.id))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategoryId === String(cat.id) ? 'bg-rose-50 text-rose-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Rating */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <h3 className="font-semibold mb-3">⭐ Rating Minimal</h3>
              <input 
                type="range" min="0" max="5" step="0.5" 
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">0</span>
                <span className="font-bold text-rose-600">{minRating} +</span>
                <span className="text-gray-500">5</span>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            {/* Desktop Sort Bar */}
            <div className="hidden md:flex justify-between items-center mb-4 bg-white p-3 rounded-xl border shadow-sm">
              <span className="text-sm text-gray-500">Menampilkan <b>{results.length}</b> hasil</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Urutkan:</span>
                <select 
                  className="border-none text-sm font-medium focus:ring-0 cursor-pointer bg-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Paling Relevan</option>
                  <option value="nearest">Terdekat</option>
                  <option value="rating_desc">Rating Tertinggi</option>
                </select>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm border border-red-100 flex items-center gap-2">
                <svg className="w-5 h-5 min-w-[1.25rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="py-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-2"></div>
                Sedang mencari kuliner enak...
              </div>
            )}

            {/* EMPTY STATE */}
            {!isLoading && !error && results.length === 0 && hasSearchedOnce && (
              <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                <div className="text-4xl mb-2">🍜</div>
                <h3 className="font-semibold text-gray-900">Belum ada hasil</h3>
                <p className="text-sm text-gray-500 mt-1">Coba ganti kata kunci atau kurangi filter.</p>
              </div>
            )}

            {/* GRID RESULTS */}
            {!isLoading && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(place => (
                  <RestaurantCard
                    key={place.id}
                    data={place}
                    isFavorite={favorites.includes(place.id)}
                    onToggleFavorite={onToggleFavorite}
                    onClick={() => onViewDetail(place)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- MOBILE MODALS --- */}

      {/* 1. MOBILE FILTER MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900">Filter Pencarian</h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)} 
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Kota */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📍 Kota</label>
                <select className="w-full p-3 border border-gray-300 rounded-xl bg-white" value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)}>
                  <option value="auto">📍 Otomatis (Lokasi Saya)</option>
                  <option value="all">🌐 Semua Kota</option>
                  <option disabled>──────────</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🍱 Kategori</label>
                <select className="w-full p-3 border border-gray-300 rounded-xl bg-white" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                  <option value="all">Semua Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* [FIX] Rating Filter di Mobile */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">⭐ Rating Minimal</label>
                  <span className="text-sm font-bold text-rose-600">{minRating} +</span>
                </div>
                <input 
                  type="range" min="0" max="5" step="0.5" 
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full accent-rose-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span><span>5</span>
                </div>
              </div>

              <button 
                onClick={() => setIsMobileFilterOpen(false)} 
                className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 active:scale-95 transition-transform"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. [FIX] MOBILE SORT MODAL (Sekarang sudah ada!) */}
      {isMobileSortOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900">Urutkan Berdasarkan</h3>
              <button 
                onClick={() => setIsMobileSortOpen(false)} 
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { val: 'relevance', label: '✨ Paling Relevan' },
                { val: 'nearest', label: '📍 Terdekat dari Saya' },
                { val: 'rating_desc', label: '⭐ Rating Tertinggi' }
              ].map((opt) => (
                <label 
                  key={opt.val} 
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${sortBy === opt.val ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${sortBy === opt.val ? 'text-rose-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                  </div>
                  <input 
                    type="radio" 
                    name="sortMobile" 
                    value={opt.val} 
                    checked={sortBy === opt.val} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-5 h-5 text-rose-600 focus:ring-rose-500 border-gray-300"
                  />
                </label>
              ))}
            </div>

            <button 
              onClick={() => setIsMobileSortOpen(false)} 
              className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 mt-6 active:scale-95 transition-transform"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};