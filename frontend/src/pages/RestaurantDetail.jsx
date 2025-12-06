import React from 'react';
import { StarRating } from '../components/StarRating';

export const RestaurantDetail = ({ 
  restaurant, 
  reviews, 
  isFavorite, 
  onToggleFavorite, 
  onBack 
}) => {
  return (
    <div className="py-6 animate-fade-in-up">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-brand-600 mb-6 transition-colors font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Pencarian
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
               <button
                onClick={() => onToggleFavorite(restaurant.id)}
                className={`p-3 rounded-full backdrop-blur-md shadow-lg ${
                  isFavorite ? 'bg-white text-brand-500' : 'bg-black/40 text-white hover:bg-black/60'
                } transition-all transform hover:scale-105`}
              >
                <svg
                  className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'fill-none stroke-current'}`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8">
              <span className="bg-brand-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-2 inline-block">
                {restaurant.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 shadow-sm">{restaurant.name}</h1>
              <div className="flex items-center gap-4 text-white/90 text-sm sm:text-base">
                 <div className="flex items-center gap-2">
                   <span className="text-secondary-500 text-lg font-bold">★ {restaurant.rating}</span>
                   <span className="opacity-75">({restaurant.reviews} ulasan)</span>
                 </div>
                 <span className="w-1 h-1 bg-white rounded-full"></span>
                 <span>{restaurant.city}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Restoran</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {restaurant.description}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Ulasan Pengunjung</h2>
                <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">Lihat Semua</button>
            </div>
            
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                     <img 
                                        src={`https://ui-avatars.com/api/?name=${review.user}&background=random`} 
                                        alt={review.user}
                                        className="w-full h-full"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">{review.user}</h4>
                                    <span className="text-xs text-gray-500">{review.date}</span>
                                </div>
                            </div>
                            <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-600 text-sm mt-2">"{review.comment}"</p>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 sticky top-24">
                <h3 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">Informasi</h3>
                
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-brand-50 text-brand-600 rounded-lg">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 font-medium uppercase">Alamat</span>
                            <p className="text-gray-800 text-sm font-medium">{restaurant.address}</p>
                        </div>
                    </li>

                    <li className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 font-medium uppercase">Jam Buka</span>
                            <p className="text-gray-800 text-sm font-medium">{restaurant.openHours}</p>
                        </div>
                    </li>

                    <li className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-green-50 text-green-600 rounded-lg">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 font-medium uppercase">Range Harga</span>
                            <p className="text-gray-800 text-sm font-medium">{restaurant.priceRange}</p>
                        </div>
                    </li>
                </ul>

                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${restaurant.coordinates?.lat},${restaurant.coordinates?.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 block w-full bg-brand-600 hover:bg-brand-700 text-white text-center py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-brand-500/30"
                >
                    Buka di Google Maps
                </a>
             </div>
        </div>
      </div>
    </div>
  );
};