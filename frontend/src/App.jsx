import React, { useState, useMemo } from 'react';
import { RESTAURANTS, CITIES, MOCK_USER_REVIEWS, getRestaurantReviews, getUserProfile } from './services/mockData';
import { RestaurantCard } from './components/RestaurantCard';
import { ChatAssistant } from './components/ChatAssistant';
import { LoginForm, RegisterForm } from './components/Auth';
import { Profile } from './pages/Profile';
import { Wishlist } from './pages/Wishlist';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { PublicProfile } from './pages/PublicProfile';

function App() {
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    setIsMobileMenuOpen(false);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const handleUserClick = (username) => {
    const userProfile = getUserProfile(username);
    setSelectedUserProfile(userProfile);
    setCurrentPage('public-profile');
    window.scrollTo(0, 0);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter(r => {
      const matchesCity = selectedCity === 'Semua' || r.city === selectedCity;
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [selectedCity, searchQuery]);

  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return <LoginForm onLogin={handleLogin} onSwitchMode={() => setCurrentPage('register')} />;
      case 'register':
        return <RegisterForm onLogin={handleLogin} onSwitchMode={() => setCurrentPage('login')} />;
      case 'profile':
        if (!user) {
          setCurrentPage('login');
          return null;
        }
        return <Profile user={user} reviews={MOCK_USER_REVIEWS} onLogout={handleLogout} />;
      
      case 'public-profile':
        if (!selectedUserProfile) return null;
        return <PublicProfile user={selectedUserProfile} onBack={() => setCurrentPage('detail')} />;
      
      case 'wishlist':
        return (
          <Wishlist 
            restaurants={RESTAURANTS} 
            favorites={favorites} 
            onToggleFavorite={toggleFavorite}
            onViewDetail={handleRestaurantClick}
          />
        );
      case 'detail':
        if (!selectedRestaurant) return null;
        return (
          <RestaurantDetail 
            restaurant={selectedRestaurant} 
            reviews={getRestaurantReviews(selectedRestaurant.id)}
            isFavorite={favorites.includes(selectedRestaurant.id)}
            onToggleFavorite={toggleFavorite}
            onBack={() => setCurrentPage('home')}
            onUserClick={handleUserClick}
          />
        );
      case 'home':
      default:
        return (
          <>
             <div className="relative bg-brand-600 text-white overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/food.png')" }}></div>
              <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Jelajahi Rasa Nusantara</h2>
                <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
                  Temukan kuliner terbaik di Makassar, Jakarta, Bandung, Yogyakarta, dan Surabaya dalam satu genggaman.
                </p>
                
                <div className="max-w-2xl mx-auto relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-4 border-none rounded-full leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-brand-500/50 shadow-xl"
                    placeholder="Cari coto, sate, gudeg, atau nama tempat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-2 mb-6 scrollbar-hide">
              <button onClick={() => setSelectedCity('Semua')} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCity === 'Semua' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>Semua Kota</button>
              {CITIES.map(city => (
                <button key={city} onClick={() => setSelectedCity(city)} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCity === city ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>{city}</button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedCity === 'Semua' ? 'Rekomendasi Terpopuler' : `Kuliner di ${selectedCity}`}
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredRestaurants.length} tempat)</span>
              </h2>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button onClick={() => setViewMode('map')} className={`p-2 rounded ${viewMode === 'map' ? 'bg-gray-100 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </button>
              </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurant) => (
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
                        <h3 className="text-lg font-medium text-gray-900">Tidak ada restoran ditemukan</h3>
                        <p className="text-gray-500">Coba ubah kata kunci pencarian atau pilih kota lain.</p>
                    </div>
                )}
                </div>
            ) : (
                <div className="w-full h-[600px] bg-gray-200 rounded-xl overflow-hidden relative flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg">
                         <svg className="w-16 h-16 text-brand-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Tampilan Peta Interaktif</h3>
                        <p className="text-gray-600 mb-4 max-w-md">Fitur ini menggunakan Google Maps API. Dalam versi demo ini, kami menampilkan data dalam format Grid.</p>
                        <button onClick={() => setViewMode('grid')} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">Kembali ke Grid View</button>
                    </div>
                </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🍛</span>
              <h1 className="text-2xl font-extrabold text-brand-600 tracking-tight">Makan Ki'</h1>
            </button>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <button onClick={() => navigateTo('home')} className={`hover:text-brand-500 transition-colors ${currentPage === 'home' ? 'text-brand-600' : ''}`}>Beranda</button>
              <button onClick={() => navigateTo('wishlist')} className={`hover:text-brand-500 transition-colors ${currentPage === 'wishlist' ? 'text-brand-600' : ''}`}>Wishlist ({favorites.length})</button>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              {user ? (
                <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 text-gray-800 hover:text-brand-600 transition-colors">
                  <img src={`https://ui-avatars.com/api/?name=${user.name}&background=e11d48&color=fff`} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                  <span>{user.name}</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                    <button onClick={() => navigateTo('login')} className="text-gray-600 hover:text-brand-600 transition-colors">Masuk</button>
                    <button onClick={() => navigateTo('register')} className="bg-brand-600 text-white px-4 py-2 rounded-full hover:bg-brand-700 transition-shadow shadow-md shadow-brand-500/20">Daftar</button>
                </div>
              )}
            </nav>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-600 p-2 rounded-md hover:bg-gray-100 focus:outline-none">
               {isMobileMenuOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-fade-in-up">
            <div className="px-4 py-2 space-y-1">
              <button onClick={() => navigateTo('home')} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Beranda</button>
              <button onClick={() => navigateTo('wishlist')} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Wishlist ({favorites.length})</button>
              <div className="border-t border-gray-200 my-2"></div>
              {user ? (
                <>
                  <button onClick={() => navigateTo('profile')} className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                    <img src={`https://ui-avatars.com/api/?name=${user.name}&background=e11d48&color=fff`} alt="Avatar" className="w-8 h-8 rounded-full" /> Profil ({user.name})
                  </button>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">Keluar</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-3 py-3">
                    <button onClick={() => navigateTo('login')} className="w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Masuk</button>
                    <button onClick={() => navigateTo('register')} className="w-full text-center px-4 py-2 bg-brand-600 rounded-lg text-white font-medium hover:bg-brand-700">Daftar</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {renderContent()}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-12 border-t border-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">© 2024 Makan Ki'. All rights reserved.</div>
      </footer>

      <ChatAssistant />
    </div>
  );
}

export default App;