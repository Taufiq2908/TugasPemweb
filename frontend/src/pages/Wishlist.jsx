import React from 'react';
import { RestaurantCard } from '../components/RestaurantCard';

export const Wishlist = ({ restaurants, favorites, onToggleFavorite, onViewDetail }) => {
  const favoriteRestaurants = restaurants.filter(r => favorites.includes(r.id));

  return (
    <div className="py-8 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Wishlist Kuliner Anda</h2>
        <p className="text-gray-600">Daftar tempat makan impian yang ingin Anda kunjungi.</p>
      </div>

      {favoriteRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteRestaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              data={restaurant} 
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onClick={onViewDetail}
            />
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