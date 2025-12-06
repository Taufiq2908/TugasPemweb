import React from 'react';
import { StarRating } from '../components/StarRating';

export const Profile = ({ user, reviews, onLogout }) => {
  const getBadgeColor = (level) => {
    switch (level) {
      case 'Foodie Master': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Explorer': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
            <div className="bg-brand-600 h-24"></div>
            <div className="px-6 pb-6 text-center -mt-12">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md mx-auto">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <div className="absolute bottom-0 right-0 bg-secondary-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Level">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
              </div>
              
              <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(user.level)} mb-6`}>
                Level: {user.level}
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-4 text-sm">
                <div className="text-center w-1/2 border-r border-gray-100">
                  <span className="block font-bold text-gray-900 text-lg">{user.reviewCount}</span>
                  <span className="text-gray-500">Ulasan</span>
                </div>
                <div className="text-center w-1/2">
                  <span className="block font-bold text-gray-900 text-lg">{user.joinDate}</span>
                  <span className="text-gray-500">Bergabung</span>
                </div>
              </div>

              <button 
                onClick={onLogout}
                className="mt-6 w-full py-2 px-4 border border-brand-500 text-brand-500 rounded-lg hover:bg-brand-50 transition-colors text-sm font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📝</span> Riwayat Ulasan
            </h3>
            
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.restaurantName}</h4>
                                    <span className="text-xs text-gray-400">{review.date}</span>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">
                                "{review.comment}"
                            </p>
                            <div className="mt-3 flex justify-end">
                                <button className="text-xs text-brand-600 hover:text-brand-500 font-medium">
                                    Lihat Tempat →
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="text-4xl mb-3">😶</div>
                        <p className="text-gray-500 font-medium">Belum ada ulasan yang dibuat.</p>
                        <p className="text-gray-400 text-sm mt-1">Ayo mulai jelajahi kuliner dan bagikan pendapatmu!</p>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-gradient-to-r from-brand-600 to-secondary-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h4 className="font-bold text-lg">Kejar Level "Foodie Master"!</h4>
                        <p className="text-brand-100 text-sm">Tulis 7 ulasan lagi untuk naik level.</p>
                    </div>
                    <span className="text-2xl font-bold">30%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5">
                    <div className="bg-white h-2.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};