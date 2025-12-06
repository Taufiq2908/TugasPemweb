import React, { useState, useMemo } from 'react';
import { RestaurantCard } from '../components/RestaurantCard';

export const SearchPage = ({ 
  restaurants, 
  favorites, 
  onToggleFavorite,
  onViewDetail
}) => {
  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Filter States ---
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  // --- Derived Data for Filters ---
  const allCategories = Array.from(new Set(restaurants.map(r => r.category)));
  // Mengambil unik fasilitas dari semua restoran
  const allFacilities = Array.from(new Set(restaurants.flatMap(r => r.facilities || [])));

  // --- Handlers ---
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const togglePrice = (price) => {
    setSelectedPrices(prev => 
        prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]
    );
  };

  const toggleFacility = (facility) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  // --- Filtering & Sorting Logic ---
  const filteredAndSortedRestaurants = useMemo(() => {
    let result = restaurants.filter(r => {
      // 0. Text Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesDesc = r.description.toLowerCase().includes(query);
        const matchesCategory = r.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      // 1. Category Filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(r.category)) return false;
      
      // 2. Price Filter
      if (selectedPrices.length > 0 && !selectedPrices.includes(r.priceRange)) return false;

      // 3. Rating Filter
      if (r.rating < minRating) return false;

      // 4. Facility Filter (Must contain ALL selected)
      if (selectedFacilities.length > 0) {
        const hasAllFacilities = selectedFacilities.every(f => r.facilities && r.facilities.includes(f));
        if (!hasAllFacilities) return false;
      }

      return true;
    });

    // 5. Sorting
    switch (sortBy) {
        case 'rating_desc':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'price_asc':
            const priceMapAsc = {'Murah': 1, 'Sedang': 2, 'Mahal': 3};
            result.sort((a, b) => priceMapAsc[a.priceRange] - priceMapAsc[b.priceRange]);
            break;
        case 'price_desc':
            const priceMapDesc = {'Murah': 1, 'Sedang': 2, 'Mahal': 3};
            result.sort((a, b) => priceMapDesc[b.priceRange] - priceMapDesc[a.priceRange]);
            break;
        case 'distance':
            // Simulasi: Sort berdasarkan ID karena belum ada GPS riil
            result.sort((a, b) => a.id.localeCompare(b.id)); 
            break;
        default:
            // Relevance (Keep original order)
            break;
    }

    return result;
  }, [restaurants, searchQuery, selectedCategories, selectedPrices, minRating, selectedFacilities, sortBy]);

  return (
    <div className="py-6 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pencarian Kuliner</h1>
        <p className="text-gray-600">Temukan makanan terbaik dengan filter lengkap sesuai selera Anda.</p>
      </div>
      
      {/* Main Search Bar */}
      <div className="relative mb-8 shadow-lg rounded-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 border-2 border-transparent focus:border-brand-500 rounded-full leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-lg transition-colors"
            placeholder="Cari nama restoran, menu, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 space-y-6">
          
          <div className="flex items-center justify-between lg:hidden mb-4">
             <span className="font-bold text-gray-700">Filter Hasil</span>
             <button 
                onClick={() => {
                    setSelectedCategories([]);
                    setSelectedPrices([]);
                    setSelectedFacilities([]);
                    setMinRating(0);
                    setSearchQuery('');
                }}
                className="text-xs text-brand-600 font-medium"
             >
                Reset
             </button>
          </div>

          {/* Category Filter */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🍱</span> Kategori
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {allCategories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💰</span> Harga
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Murah', 'Sedang', 'Mahal'].map(price => (
                <button
                    key={price}
                    onClick={() => togglePrice(price)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        selectedPrices.includes(price)
                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {price}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
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
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                 />
                 <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs text-gray-500">Minimal:</span>
                    <span className="text-secondary-500 font-bold flex items-center gap-1">
                        {minRating} <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </span>
                 </div>
            </div>
          </div>

          {/* Facilities Filter */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>✨</span> Fasilitas
            </h3>
            <div className="space-y-2">
              {allFacilities.map(fac => (
                <label key={fac} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedFacilities.includes(fac)}
                    onChange={() => toggleFacility(fac)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{fac}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
           {/* Controls */}
           <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-20 z-10">
              <span className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Menampilkan <strong>{filteredAndSortedRestaurants.length}</strong> tempat kuliner
              </span>
              
              <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 whitespace-nowrap">Urutkan:</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border-gray-300 border rounded-lg p-2 focus:ring-brand-500 focus:border-brand-500 bg-gray-50 min-w-[140px]"
                  >
                      <option value="relevance">Paling Sesuai</option>
                      <option value="distance">Jarak Terdekat</option>
                      <option value="rating_desc">Rating Tertinggi</option>
                      <option value="price_asc">Harga Terendah</option>
                      <option value="price_desc">Harga Tertinggi</option>
                  </select>
              </div>
           </div>

           {/* Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedRestaurants.length > 0 ? (
                filteredAndSortedRestaurants.map(restaurant => (
                    <RestaurantCard 
                        key={restaurant.id}
                        data={restaurant}
                        isFavorite={favorites.includes(restaurant.id)}
                        onToggleFavorite={onToggleFavorite}
                        onClick={onViewDetail}
                    />
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Tidak ada hasil ditemukan</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Coba kurangi filter atau gunakan kata kunci pencarian yang lebih umum.
                    </p>
                    <button 
                        onClick={() => {
                            setSelectedCategories([]);
                            setSelectedPrices([]);
                            setSelectedFacilities([]);
                            setMinRating(0);
                            setSearchQuery('');
                        }}
                        className="mt-6 px-6 py-2 bg-brand-50 text-brand-700 font-medium rounded-lg hover:bg-brand-100 transition-colors"
                    >
                        Reset Pencarian
                    </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};