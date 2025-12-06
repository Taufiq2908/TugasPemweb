import React from 'react';
import { StarRating } from './StarRating';

export const RestaurantCard = ({ data, isFavorite, onToggleFavorite, onClick }) => {
  return (
    <div 
      onClick={() => onClick(data)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={data.imageUrl}
          alt={data.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(data.id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm ${
              isFavorite ? 'bg-brand-50 text-brand-500' : 'bg-black/30 text-white hover:bg-black/50'
            } transition-colors`}
          >
            <svg
              className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'fill-none stroke-current'}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3">
            <span className="text-white text-xs font-bold uppercase tracking-wider bg-brand-500 px-2 py-0.5 rounded-sm">
                {data.city}
            </span>
        </div>
      </div>

      <div className="p-4 flex flex-col grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">{data.name}</h3>
        </div>
        
        <div className="mb-2">
           <StarRating rating={data.rating} />
           <span className="text-xs text-gray-400">{data.reviews} ulasan</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3 grow">
          {data.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {data.openHours}
            </div>
            <span className={`font-semibold px-2 py-1 rounded ${
                data.priceRange === 'Murah' ? 'bg-green-100 text-green-700' :
                data.priceRange === 'Sedang' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
            }`}>
                {data.priceRange}
            </span>
        </div>
      </div>
    </div>
  );
};