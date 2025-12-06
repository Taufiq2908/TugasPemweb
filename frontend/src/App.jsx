import React, { useState, useMemo, useEffect } from 'react';
import { RESTAURANTS, CITIES, MOCK_USER_REVIEWS, getRestaurantReviews, getUserProfile } from './services/mockData';
import { RestaurantCard } from './components/RestaurantCard';
import { ChatAssistant } from './components/ChatAssistant';
import { LoginForm, RegisterForm } from './components/Auth';

// IMPORT DARI FOLDER PAGES
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { Wishlist } from './pages/Wishlist';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { SearchPage } from './pages/SearchPage';

function App() {
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  
  // Auth & Navigation State
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE & LOGIKA LOKASI ---
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');

  useEffect(() => {
    if (currentPage === 'home') {
      const hasAskedLocation = localStorage.getItem('hasAskedLocation');
      if (!hasAskedLocation) {
        const timer = setTimeout(() => { setShowLocationModal(true); }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentPage]);

  const handleAllowLocation = () => {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung.");
      setLocationStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem('userLat', latitude);
        localStorage.setItem('userLng', longitude);
        localStorage.setItem('hasAskedLocation', 'true');
        setLocationStatus('success');
        setTimeout(() => setShowLocationModal(false), 1000);
      }, (error) => {
        console.error(error);
        setLocationStatus('error');
        localStorage.setItem('hasAskedLocation', 'true');
        setTimeout(() => setShowLocationModal(false), 2000);
      }
    );
  };

  const handleDenyLocation = () => {
    localStorage.setItem('hasAskedLocation', 'true');
    setShowLocationModal(false);
  };

  // --- LOGIKA UTAMA ---
  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleLogin = (userData) => {
    const fullUserData = {
        ...userData,
        city: userData.city || 'Belum Diatur',
        totalUpvotes: userData.totalUpvotes || 0,
        avatarUrl: userData.avatarUrl || undefined
    };
    setUser(fullUserData);
    setCurrentPage('home');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    setIsMobileMenuOpen(false);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const handleUserClick = (username) => {
    if (user && user.name === username) {
        setCurrentPage('profile');
    } else {
        const userProfile = getUserProfile(username);
        setSelectedUserProfile(userProfile);
        setCurrentPage('public-profile');
    }
    window.scrollTo(0, 0);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter(r => {
      const matchesCity = selectedCity === 'Semua' || r.city === selectedCity;
      return matchesCity;
    });
  }, [selectedCity]);

  // Main Content Renderer
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
        return (
            <Profile 
                user={user} 
                reviews={MOCK_USER_REVIEWS} 
                onLogout={handleLogout} 
                onUpdateUser={handleUpdateUser}
            />
        );
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
      case 'search':
        return (
          <SearchPage 
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
            user={user}
            onAuthRequest={() => navigateTo('login')}
          />
        );
      case 'home':
      default:
        return (
          <>
             {/* Hero Section */}
            <div className="relative bg-rose-600 text-white overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/food.png')" }}></div>
              <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Jelajahi Rasa Nusantara</h2>
                <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
                  Temukan kuliner terbaik di Makassar, Jakarta, Bandung, Yogyakarta, dan Surabaya dalam satu genggaman.
                </p>
                
                {/* Advanced Search Entry Point */}
                <div 
                    onClick={() => setCurrentPage('search')}
                    className="max-w-2xl mx-auto bg-white rounded-full p-2 shadow-2xl flex items-center transform transition-all hover:scale-[1.02] duration-300 cursor-pointer group ring-4 ring-rose-500/30"
                >
                  <div className="grow pl-6 pr-4 py-3 text-left">
                     <span className="block text-gray-400 text-sm md:text-base group-hover:text-gray-600 transition-colors">
                        Ingin cari Coto, Sate, atau Gudeg?
                     </span>
                  </div>
                  <button 
                    className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition shadow-md flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Cari
                  </button>
                </div>
                <p className="mt-4 text-rose-200 text-sm">
                    Gunakan fitur <b>Pencarian</b> untuk filter harga, fasilitas, dan rating.
                </p>
              </div>
            </div>

            {/* City Filter Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-2 mb-6 scrollbar-hide">
              <button onClick={() => setSelectedCity('Semua')} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCity === 'Semua' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>Semua Kota</button>
              {CITIES.map(city => (
                <button key={city} onClick={() => setSelectedCity(city)} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCity === city ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>{city}</button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedCity === 'Semua' ? 'Rekomendasi Terpopuler' : `Kuliner di ${selectedCity}`}
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredRestaurants.length} tempat)</span>
              </h2>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button onClick={() => setViewMode('map')} className={`p-2 rounded ${viewMode === 'map' ? 'bg-gray-100 text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </button>
              </div>
            </div>

            {/* Grid/Map Content */}
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
                        <p className="text-gray-500">Belum ada data untuk kota ini.</p>
                    </div>
                )}
                </div>
            ) : (
                <div className="w-full h-[600px] bg-gray-200 rounded-xl overflow-hidden relative flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg">
                        <svg className="w-16 h-16 text-rose-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Tampilan Peta Interaktif</h3>
                        <p className="text-gray-600 mb-4 max-w-md">
                            Fitur ini menggunakan Google Maps API. Dalam versi demo ini, kami menampilkan data dalam format Grid. 
                            Silakan gunakan tombol "Lihat di Peta" pada setiap kartu restoran untuk navigasi langsung.
                        </p>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition"
                        >
                            Kembali ke Grid View
                        </button>
                    </div>
                </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Pop Up Izin Lokasi */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100">
            <div className="mb-4 flex justify-center">
              {locationStatus === 'loading' ? (
                <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
              ) : locationStatus === 'success' ? (
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl animate-bounce">📍</div>
              ) : (
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-3xl">🗺️</div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {locationStatus === 'loading' ? 'Mencari Lokasi...' : 
               locationStatus === 'success' ? 'Lokasi Ditemukan!' : 
               'Aktifkan Lokasi?'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {locationStatus === 'loading' 
                ? 'Mohon tunggu sebentar...' 
                : locationStatus === 'success'
                ? 'Terima kasih! Kami akan mencarikan kuliner terdekat.'
                : 'Izinkan kami mengakses lokasi Anda untuk memberikan rekomendasi restoran terdekat dan rute yang akurat.'}
            </p>
            {locationStatus === 'idle' || locationStatus === 'error' ? (
              <div className="flex gap-3 flex-col sm:flex-row">
                <button onClick={handleDenyLocation} className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition text-sm">Nanti Saja</button>
                <button onClick={handleAllowLocation} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/30 transition text-sm">Aktifkan</button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* 1. LOGO & BRAND */}
            <button 
                onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🍛</span>
              <h1 className="text-2xl font-extrabold text-rose-600 tracking-tight">Makan Ki'</h1>
            </button>
            
            {/* 2. DESKTOP NAVIGATION (Hidden di Mobile) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <button 
                onClick={() => setCurrentPage('home')} 
                className={`hover:text-rose-500 transition-colors ${currentPage === 'home' ? 'text-rose-600 font-bold' : ''}`}
              >
                Beranda
              </button>
              
              <button 
                onClick={() => setCurrentPage('wishlist')}
                className={`hover:text-rose-500 transition-colors ${currentPage === 'wishlist' ? 'text-rose-600 font-bold' : ''}`}
              >
                Wishlist ({favorites.length})
              </button>
              
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              
              {user ? (
                // State: SUDAH LOGIN (Desktop)
                <button 
                  onClick={() => setCurrentPage('profile')}
                  className="flex items-center gap-2 text-gray-800 hover:text-rose-600 transition-colors"
                >
                  <img 
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=e11d48&color=fff`} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                  />
                  <span>{user.name}</span>
                </button>
              ) : (
                // State: BELUM LOGIN (Desktop)
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setCurrentPage('login')}
                        className="text-gray-600 hover:text-rose-600 transition-colors"
                    >
                        Masuk
                    </button>
                    <button 
                        onClick={() => setCurrentPage('register')}
                        className="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition-shadow shadow-md shadow-rose-500/20"
                    >
                        Daftar
                    </button>
                </div>
              )}
            </nav>

            {/* 3. TOMBOL HAMBURGER (Hanya muncul di Mobile) */}
            <button 
              className="md:hidden text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
               {isMobileMenuOpen ? (
                 // Icon X (Close)
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               ) : (
                 // Icon Hamburger (Menu)
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
               )}
            </button>
          </div>
        </div>

        {/* 4. MOBILE MENU DROPDOWN (LAYOUT BARU: PROFIL DI ATAS) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 z-40 animate-fade-in">
            <div className="flex flex-col">
              
              {/* --- A. BAGIAN ATAS: PROFIL / AUTH --- */}
              {user ? (
                // Jika LOGIN: Tampilkan Profil Besar
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=e11d48&color=fff`} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full border border-gray-200 object-cover" 
                    />
                    <div className="overflow-hidden">
                        <span className="block font-bold text-gray-900 text-lg truncate">{user.name}</span>
                        <span className="block text-sm text-gray-500 truncate">{user.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setCurrentPage('profile'); setIsMobileMenuOpen(false); }}
                    className="w-full py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center shadow-sm"
                  >
                    Lihat Profil
                  </button>
                </div>
              ) : (
                // Jika BELUM LOGIN: Tombol Masuk/Daftar
                <div className="p-4 border-b border-gray-100 grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => { setCurrentPage('login'); setIsMobileMenuOpen(false); }}
                        className="py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
                    >
                        Masuk
                    </button>
                    <button 
                        onClick={() => { setCurrentPage('register'); setIsMobileMenuOpen(false); }}
                        className="py-2.5 bg-rose-600 text-white rounded-lg font-bold shadow-sm hover:bg-rose-700"
                    >
                        Daftar
                    </button>
                </div>
              )}

              {/* --- B. BAGIAN TENGAH: NAVIGASI --- */}
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }} 
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${currentPage === 'home' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Beranda
                </button>
                
                <button 
                  onClick={() => { setCurrentPage('wishlist'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${currentPage === 'wishlist' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Wishlist ({favorites.length})
                </button>
              </div>

              {/* --- C. BAGIAN BAWAH: LOGOUT (Hanya jika login) --- */}
              {user && (
                <div className="p-2 border-t border-gray-100 mt-2">
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Keluar
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
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
                    Platform pencarian kuliner terpercaya di 5 kota besar Indonesia. Temukan rasa autentik nusantara.
                </p>
            </div>
            <div>
                <h4 className="text-white font-medium mb-4">Kota</h4>
                <ul className="space-y-2 text-sm">
                    <li>Makassar</li>
                    <li>Jakarta</li>
                    <li>Bandung</li>
                    <li>Yogyakarta</li>
                    <li>Surabaya</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-medium mb-4">Tim Pengembang</h4>
                <ul className="space-y-2 text-sm">
                    <li>Muh Ilham Yusal : Frontend & UI/UX</li>
                    <li>Taufiqurrahman Hendra : Backend & Database</li>
                    <li>Giri Kencana Jati : Data & Laporan</li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            © 2077 Makan Ki'. Dibuat oleh 3 penimpa.
        </div>
      </footer>

      {/* Chat Bot Integration */}
      <ChatAssistant />
    </div>
  );
}

export default App;