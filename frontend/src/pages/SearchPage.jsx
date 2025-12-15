// frontend/src/pages/SearchPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RestaurantCard } from '../components/RestaurantCard';

// Base URL API
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SearchPage = ({
  initialQuery = '', 
  restaurants = [],
  favorites = [],
  onToggleFavorite,
  onViewDetail
}) => {
  // --- STATE (LOGIC TETAP) ---
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState('auto'); 
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

  // --- 2. HELPER: Parsing Foto ---
  const getCoverImage = (place) => {
    if (place.cover_image_url) return place.cover_image_url;
    if (place.photos) {
      if (Array.isArray(place.photos) && place.photos.length > 0) {
        return place.photos[0];
      }
      if (typeof place.photos === 'string') {
        try {
          let cleanStr = place.photos;
          if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
             cleanStr = cleanStr.slice(1, -1);
          }
          cleanStr = cleanStr.replace(/\\"/g, '"'); 
          const parsed = JSON.parse(cleanStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch (e) {
          console.warn("Photo parse failed", e);
        }
      }
    }
    return 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg';
  };

  // --- 3. MAPPING DATA ---
  const mapPlaceToCard = (place) => {
    return {
      id: place.id,
      name: place.name,
      city: place.cities?.name || place.city_name || 'Kota tidak diketahui', 
      location: place.address || '',
      rating: place.average_rating || 0,
      reviews: place.total_reviews || 0,
      description: place.description || '',
      priceRange: place.price_range_label || 'Sedang', 
      coverImage: getCoverImage(place),
      distanceKm: place.distance_km || null,
      categoryId: null, 
      raw: place
    };
  };

  // --- 4. ENGINE PENCARIAN ---
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

      if (qTrimmed) params.append('q', qTrimmed);

      if (selectedCityId === 'auto') {
        if (userCityId) {
          params.append('city_id', userCityId);
        } else if (userLat && userLng) {
          params.append('radius', '30'); 
        } 
      } else if (selectedCityId !== 'all') {
        params.append('city_id', selectedCityId);
      }

      if (userLat && userLng) {
        params.append('lat', userLat);
        params.append('lon', userLng);
      }

      if (selectedCategoryId !== 'all') {
        params.append('category_id', selectedCategoryId);
      }
      if (minRating > 0) {
        params.append('rating_min', minRating);
      }
      if (sortBy !== 'relevance') {
        params.append('sort', sortBy);
      }

      const url = `${API_BASE}/search/search?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("Mohon izinkan akses lokasi atau pilih kota terlebih dahulu.");
        }
        throw new Error(data.error || "Gagal mengambil data pencarian");
      }

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
  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch();
    }, 500); 
    return () => clearTimeout(timer);
  }, [selectedCategoryId, selectedCityId, minRating, sortBy, runSearch]); 

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const userCityName = localStorage.getItem('cityName') || 'Lokasi Saya';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* ================= HERO SEARCH HEADER ================= */}
      <div className="relative bg-gray-900 pt-24 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-600 to-orange-500 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-300 opacity-20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-sm">
            Temukan Rasa Terbaik
          </h1>
          
          {/* SEARCH BAR BESAR */}
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 to-orange-200 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2">
                <div className="pl-4 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-transparent border-none text-gray-800 placeholder-gray-400 focus:ring-0 text-lg"
                  placeholder="Mau makan apa? (Coto, Seafood, Bakso...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg hidden sm:block"
                >
                  Cari
                </button>
              </div>
            </div>
            {/* Mobile Search Button */}
            <button type="submit" className="sm:hidden w-full mt-3 bg-white text-rose-600 py-3 rounded-xl font-bold shadow-lg">
              🔍 Cari Sekarang
            </button>
          </form>
        </div>
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* MOBILE FILTER BAR (Sticky) */}
        <div className="md:hidden sticky top-20 z-30 mb-6">
           <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 active:bg-rose-50 active:text-rose-600 transition"
              >
                🛠 Filter
              </button>
              <button 
                onClick={() => setIsMobileSortOpen(true)}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 active:bg-rose-50 active:text-rose-600 transition"
              >
                ⇅ Urutkan
              </button>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* ================= SIDEBAR (DESKTOP) ================= */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              
              {/* Filter Kota */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-rose-100 text-rose-600 p-1 rounded">📍</span> Lokasi
                </h3>
                <div className="relative">
                  <select 
                    className="w-full p-3 pl-4 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none cursor-pointer font-medium text-gray-700"
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                  >
                    <option value="auto">📍 Otomatis ({userCityName})</option>
                    <option value="all">🌐 Semua Kota</option>
                    <option disabled>──────────</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>

              {/* Filter Kategori */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 p-1 rounded">🍱</span> Kategori
                </h3>
                <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  <button
                    onClick={() => setSelectedCategoryId('all')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex justify-between items-center ${selectedCategoryId === 'all' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'}`}
                  >
                    Semua Kategori
                    {selectedCategoryId === 'all' && <span>✓</span>}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(String(cat.id))}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex justify-between items-center ${selectedCategoryId === String(cat.id) ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'}`}
                    >
                      {cat.name}
                      {selectedCategoryId === String(cat.id) && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Rating */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <span className="bg-yellow-100 text-yellow-600 p-1 rounded">⭐</span> Rating
                </h3>
                <div className="px-2">
                  <input 
                    type="range" min="0" max="5" step="0.5" 
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full accent-rose-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400">Min Rating:</span>
                    <span className="text-sm font-bold bg-gray-900 text-white px-2 py-0.5 rounded">{minRating} +</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* ================= RESULTS GRID ================= */}
          <main className="flex-1">
            
            {/* Desktop Sort Bar & Stats */}
            <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <span className="text-gray-600 font-medium">
                Ditemukan <b className="text-rose-600 text-lg">{results.length}</b> tempat makan
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wide">Urutkan:</span>
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-rose-500 focus:border-rose-500 p-2 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">✨ Paling Relevan</option>
                  <option value="nearest">📍 Terdekat</option>
                  <option value="rating_desc">⭐ Rating Tertinggi</option>
                </select>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-6 border border-red-100 flex flex-col items-center text-center animate-pulse">
                <div className="text-4xl mb-2">📡</div>
                <h3 className="font-bold">Gagal Memuat Data</h3>
                <p className="text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold transition">
                  Coba Refresh
                </button>
              </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="py-20 text-center">
                <div className="inline-block relative">
                   <div className="w-16 h-16 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-xl">🍲</div>
                </div>
                <p className="text-gray-500 font-medium mt-4 animate-pulse">Sedang mencari kuliner enak...</p>
              </div>
            )}

            {/* EMPTY STATE */}
            {!isLoading && !error && results.length === 0 && hasSearchedOnce && (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-4 grayscale opacity-30">🤷‍♂️</div>
                <h3 className="text-xl font-bold text-gray-900">Yah, tidak ketemu...</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  Coba kurangi filter atau gunakan kata kunci lain seperti "Nasi Goreng" atau "Bakso".
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId('all');
                    setSelectedCityId('auto');
                    setMinRating(0);
                  }}
                  className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
                >
                  Reset Pencarian
                </button>
              </div>
            )}

            {/* GRID CARDS */}
            {!isLoading && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
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

      {/* ================= MOBILE FILTER MODAL ================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-black text-xl text-gray-900">Filter Pencarian</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">✕</button>
            </div>
            
            <div className="space-y-6">
              {/* Kota */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">📍 Lokasi</label>
                <select className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 font-medium" value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)}>
                  <option value="auto">📍 Otomatis (Lokasi Saya)</option>
                  <option value="all">🌐 Semua Kota</option>
                  <option disabled>──────────</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">🍱 Kategori</label>
                <select className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 font-medium" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                  <option value="all">Semua Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Rating */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">⭐ Rating Minimal</label>
                  <span className="text-sm font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded">{minRating} +</span>
                </div>
                <input 
                  type="range" min="0" max="5" step="0.5" 
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full accent-rose-600 h-2 bg-gray-200 rounded-lg appearance-none"
                />
              </div>

              <button 
                onClick={() => setIsMobileFilterOpen(false)} 
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE SORT MODAL ================= */}
      {isMobileSortOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-black text-xl text-gray-900">Urutkan</h3>
              <button onClick={() => setIsMobileSortOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">✕</button>
            </div>

            <div className="space-y-3">
              {[
                { val: 'relevance', label: '✨ Paling Relevan' },
                { val: 'nearest', label: '📍 Terdekat dari Saya' },
                { val: 'rating_desc', label: '⭐ Rating Tertinggi' }
              ].map((opt) => (
                <label 
                  key={opt.val} 
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${sortBy === opt.val ? 'border-rose-500 bg-rose-50 shadow-sm' : 'border-gray-100 bg-white'}`}
                >
                  <span className={`text-base font-bold ${sortBy === opt.val ? 'text-rose-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  <input 
                    type="radio" name="sortMobile" value={opt.val} 
                    checked={sortBy === opt.val} onChange={(e) => setSortBy(e.target.value)}
                    className="w-5 h-5 text-rose-600 focus:ring-rose-500 border-gray-300"
                  />
                </label>
              ))}
            </div>

            <button 
              onClick={() => setIsMobileSortOpen(false)} 
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg mt-6 active:scale-95 transition-transform"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};