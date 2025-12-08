// frontend/src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { RestaurantCard } from '../components/RestaurantCard';

// Base URL API (ikuti cara di Auth.jsx)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SearchPage = ({
  restaurants = [],
  favorites = [],
  onToggleFavorite,
  onViewDetail
}) => {
  // --- STATE PENCARIAN & FILTER ---
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance'); // relevance | nearest | rating_desc

  const [rawResults, setRawResults] = useState(
    restaurants.map((r) => ({
      ...r,
      rating: r.rating ?? 0,
      distanceKm: r.distanceKm ?? null
    }))
  );
  const [results, setResults] = useState(rawResults);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

  // --- STATE MOBILE FILTER UI ---
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  // Sinkronisasi jika props restaurants (mock) berubah
  useEffect(() => {
    const mapped = restaurants.map((r) => ({
      ...r,
      rating: r.rating ?? 0,
      distanceKm: r.distanceKm ?? null
    }));
    setRawResults(mapped);
  }, [restaurants]);

  // --- AMBIL KATEGORI DARI BACKEND (is_display = true) ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();

        if (res.ok) {
          // tampilkan hanya kategori utama (is_display = true)
          const visibleCategories = data.filter(cat => cat.is_display);
          setCategories(visibleCategories);
        } else {
          console.error("Gagal mengambil kategori:", data.message);
        }
      } catch (err) {
        console.error("Error fetch kategori:", err);
      }
    };

    fetchCategories();
  }, []);


  // --- HELPER: KONVERSI price_range string → label Murah/Sedang/Mahal ---
  const derivePriceRangeLabel = (priceRangeString) => {
    if (!priceRangeString || typeof priceRangeString !== 'string') return 'Sedang';
    const nums = priceRangeString.match(/\d+/g);
    if (!nums || nums.length === 0) return 'Sedang';

    const values = nums
      .map((n) => parseInt(n, 10))
      .filter((n) => !Number.isNaN(n));

    if (!values.length) return 'Sedang';

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg < 20000) return 'Murah';
    if (avg < 50000) return 'Sedang';
    return 'Mahal';
  };

  // --- HELPER: PETA DATA BACKEND → SHAPE RestaurantCard ---
  const mapPlaceToCardData = (place) => {
    const priceRangeLabel =
      place.price_range_label || derivePriceRangeLabel(place.price_range);

    const distanceKm =
      place.distance_km ??
      place.distanceKm ??
      null;

    return {
      id: place.id,
      name: place.name,
      city: place.cities?.name || place.city_name || 'Tidak diketahui',
      location: place.address || '',
      rating: place.rating || 0,
      reviews: place.total_reviews || 0,
      description: place.description || '',
      priceRange: priceRangeLabel,
      coverImage:
        place.cover_image_url ||
        place.coverImage ||
        'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg',
      distanceKm,
      categoryId:
        place.category_id ??
        place.categoryId ??
        place.category?.id ??
        null,
      raw: place
    };
  };

  // --- FILTER & SORT DI FRONTEND (berlaku untuk hasil search & chatbot) ---
  useEffect(() => {
    let filtered = rawResults;

    // Filter kategori
    if (selectedCategoryId !== 'all') {
      filtered = filtered.filter(
        (p) => String(p.categoryId) === String(selectedCategoryId)
      );
    }

    // Filter rating minimal
    if (minRating > 0) {
      filtered = filtered.filter((p) => (p.rating || 0) >= minRating);
    }

    // Sort
    let sorted = [...filtered];
    if (sortBy === 'rating_desc') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'nearest') {
      sorted.sort(
        (a, b) =>
          (a.distanceKm ?? Number.POSITIVE_INFINITY) -
          (b.distanceKm ?? Number.POSITIVE_INFINITY)
      );
    }
    // relevance → biarkan urutan bawaan dari API

    setResults(sorted);
  }, [rawResults, selectedCategoryId, minRating, sortBy]);

  // --- FUNGSI PENCARIAN KE BACKEND (SEARCH / CHATBOT) ---
  const runSearch = async () => {
    setIsLoading(true);
    setError('');
    setHasSearchedOnce(true);

    try {
      const trimmed = searchQuery.trim();
      const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
      const useChatbot = words.length > 2;

      const lat = localStorage.getItem('userLat');
      const lng = localStorage.getItem('userLng');

      let places = [];

      if (useChatbot) {
        // ============================
        //  MODE CHATBOT (kalimat panjang)
        // ============================
        const body = {
          message: trimmed
        };

        if (lat && lng) {
          body.lat = Number(lat);
          body.lng = Number(lng);
        }

        const res = await fetch(`${API_BASE}/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Gagal mengambil data dari chatbot.');
        }

        // Fleksibel terhadap bentuk respons
        if (Array.isArray(data.places)) places = data.places;
        else if (Array.isArray(data.data)) places = data.data;
        else if (Array.isArray(data.results)) places = data.results;
        else if (Array.isArray(data)) places = data;
        else {
          console.warn('Respon chatbot tidak terduga:', data);
          places = [];
        }
      } else {
        // ============================
        //  MODE SEARCH BIASA (≤ 2 kata)
        // ============================
        const params = new URLSearchParams();
        if (trimmed) params.append('query', trimmed);
        if (lat && lng) {
          params.append('lat', lat);
          params.append('lng', lng);
        }

        const res = await fetch(`${API_BASE}/search/search?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Gagal mengambil data dari server.');
        }

        if (Array.isArray(data.data)) places = data.data;
        else if (Array.isArray(data)) places = data;
        else {
          console.warn('Respon search tidak terduga:', data);
          places = [];
        }
      }

      const mapped = places.map(mapPlaceToCardData);
      setRawResults(mapped);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan koneksi ke server.');
      setRawResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER ---
  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const handleCategoryChange = (value) => {
    setSelectedCategoryId(value);
  };

  const handleMinRatingChange = (e) => {
    setMinRating(Number(e.target.value));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const placesToRender = results;

  // ========================
  // RENDER
  // ========================
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* TITLE + DESKRIPSI */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Pencarian Kuliner
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Temukan makanan terbaik dengan filter lengkap sesuai selera Anda.
          </p>
        </div>

        {/* FORM SEARCH */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari nama restoran, menu, atau kategori..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-rose-600 text-white font-semibold shadow-md hover:bg-rose-700 transition-colors"
            >
              Cari
            </button>
          </div>
        </form>

        {/* MOBILE: TOMBOL FILTER & URUTKAN (TETAP SEPERTI VERSI LAMA) */}
        <div className="flex md:hidden gap-3 mb-4">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M6 10h12M10 14h8M14 18h4" />
            </svg>
            Filter
          </button>
          <button
            type="button"
            onClick={() => setIsMobileSortOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6M12 16h3" />
            </svg>
            Urutkan
          </button>
        </div>

        {/* MOBILE SHEET: FILTER (PAKAI SELECT SEPERTI VERSI LAMA) */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 flex items-end md:hidden">
            <div className="w-full bg-white rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Filter</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Kategori */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="all">Semua</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Minimal */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating minimal
                </label>
                <select
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                >
                  <option value={0}>Semua</option>
                  <option value={3}>3.0+</option>
                  <option value={4}>4.0+</option>
                  <option value={4.5}>4.5+</option>
                </select>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setIsMobileFilterOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm"
                >
                  Terapkan
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE SHEET: SORT (TETAP) */}
        {isMobileSortOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 flex items-end md:hidden">
            <div className="w-full bg-white rounded-t-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Urutkan</h3>
                <button
                  onClick={() => setIsMobileSortOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="sort-mobile"
                    value="relevance"
                    checked={sortBy === 'relevance'}
                    onChange={handleSortChange}
                  />
                  <span>Paling sesuai</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="sort-mobile"
                    value="nearest"
                    checked={sortBy === 'nearest'}
                    onChange={handleSortChange}
                  />
                  <span>Terdekat</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="sort-mobile"
                    value="rating_desc"
                    checked={sortBy === 'rating_desc'}
                    onChange={handleSortChange}
                  />
                  <span>Rating tertinggi</span>
                </label>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setIsMobileSortOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm"
                >
                  Terapkan
                </button>
                <button
                  onClick={() => setIsMobileSortOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP: LAYOUT DUA KOLOM (SIDEBAR + KONTEN) */}
        <div className="mt-4 md:flex md:gap-6">
          {/* SIDEBAR (DESKTOP ONLY) */}
          <aside className="hidden md:block md:w-72 space-y-6">
            {/* Kategori */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🍱</span> Kategori
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedCategoryId === 'all'
                      ? 'bg-rose-50 text-rose-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      String(selectedCategoryId) === String(cat.id)
                        ? 'bg-rose-50 text-rose-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>⭐</span> Rating
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={handleMinRatingChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-xs text-gray-500">Minimal:</span>
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    {minRating.toFixed(1)}
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* KONTEN UTAMA */}
          <section className="flex-1">
            {/* Desktop: bar jumlah & sort */}
            <div className="hidden md:flex flex-col sm:flex-row justify-between items-center mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-600 mb-2 sm:mb-0">
                Menampilkan <strong>{placesToRender.length}</strong> tempat kuliner
              </span>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Urutkan</span>
                <select
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="relevance">Paling sesuai</option>
                  <option value="nearest">Terdekat</option>
                  <option value="rating_desc">Rating tertinggi</option>
                </select>
              </div>
            </div>

            {/* STATUS / ERROR */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* HASIL PENCARIAN */}
            <div className="mt-4">
              {isLoading ? (
                <div className="py-10 text-center text-gray-500 text-sm">
                  Sedang mencari kuliner terbaik untukmu...
                </div>
              ) : placesToRender.length === 0 && hasSearchedOnce ? (
                <div className="py-10 text-center">
                  <div className="text-5xl mb-2">🍜</div>
                  <h3 className="text-lg font-semibold mb-1">Belum ada hasil</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Coba ganti kata kunci atau kurangi filter agar hasilnya lebih luas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {placesToRender.map((place) => (
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
