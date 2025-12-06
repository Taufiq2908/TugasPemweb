import React, { useState, useEffect } from 'react';
import { RestaurantCard } from '../components/RestaurantCard'; // Import dari ../components
import { CITIES } from '../services/mockData';

export const Wishlist = ({ restaurants, favorites, onToggleFavorite, onViewDetail }) => {
  const [userLocation, setUserLocation] = useState('Makassar');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const favoriteRestaurants = restaurants.filter(r => favorites.includes(r.id));

  useEffect(() => {
    if (notificationsEnabled && favoriteRestaurants.length > 0) {
        const nearbyFavs = favoriteRestaurants.filter(r => r.city === userLocation);
        
        if (nearbyFavs.length > 0) {
            setNotificationMsg(`📧 Email terkirim! Anda dekat dengan ${nearbyFavs.length} restoran wishlist di ${userLocation}.`);
            const timer = setTimeout(() => setNotificationMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }
  }, [userLocation, notificationsEnabled, favoriteRestaurants, favorites]);

  return (
    <div className="py-8 animate-fade-in-up">
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
             <h2 className="text-2xl font-bold text-gray-900">Wishlist Kuliner</h2>
             <p className="text-gray-600 text-sm">Kelola daftar tempat makan impian Anda.</p>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
             <div className="flex items-center gap-2">
                 <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 <span className="text-xs font-bold text-gray-500 uppercase">Simulasi Lokasi:</span>
                 <select 
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="text-sm border-gray-300 rounded focus:ring-brand-500 focus:border-brand-500"
                 >
                     {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
             </div>
             
             <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

             <label className="flex items-center gap-2 cursor-pointer select-none">
                 <div className="relative">
                     <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                     />
                     <div className={`block w-10 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-brand-500' : 'bg-gray-300'}`}></div>
                     <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationsEnabled ? 'transform translate-x-4' : ''}`}></div>
                 </div>
                 <span className="text-sm text-gray-700 font-medium">Notifikasi Dekat Lokasi</span>
             </label>
         </div>
      </div>

      {notificationMsg && (
          <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <div>
                  <h4 className="font-bold text-sm">Notifikasi Pintar</h4>
                  <p className="text-xs">{notificationMsg}</p>
              </div>
          </div>
      )}

      {favoriteRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="relative group">
                {notificationsEnabled && restaurant.city === userLocation && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                        DEKAT LOKASI
                    </div>
                )}
                <RestaurantCard 
                    data={restaurant} 
                    isFavorite={true}
                    onToggleFavorite={onToggleFavorite}
                    onClick={onViewDetail}
                />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-4xl">
            ❤️
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Wishlist Masih Kosong</h3>
          <p className="text-gray-500 max-w-md text-center">
            Anda belum menambahkan restoran ke daftar favorit. Jelajahi rekomendasi kami dan simpan yang menarik hati Anda!
          </p>
        </div>
      )}
    </div>
  );
};