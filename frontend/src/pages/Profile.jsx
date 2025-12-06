import React, { useState } from 'react';
import { StarRating } from '../components/StarRating';
import { CITIES } from '../services/mockData';

export const Profile = ({ user, reviews, onLogout, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    city: user.city || 'Makassar',
    avatarUrl: user.avatarUrl
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData({ ...formData, avatarUrl: url });
    }
  };

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name: formData.name,
      city: formData.city,
      avatarUrl: formData.avatarUrl
    });
    setIsEditing(false);
  };

  const calculatePoints = () => {
    return (user.reviewCount * 10) + (user.totalUpvotes * 2);
  };

  const points = calculatePoints();

  const getLevelInfo = (currentPoints) => {
    if (currentPoints < 50) return { current: 'Newbie', next: 'Explorer', max: 50 };
    if (currentPoints < 150) return { current: 'Explorer', next: 'Foodie', max: 150 };
    if (currentPoints < 300) return { current: 'Foodie', next: 'Expert', max: 300 };
    if (currentPoints < 600) return { current: 'Expert', next: 'Legend', max: 600 };
    return { current: 'Legend', next: 'Max Level', max: currentPoints * 1.5 };
  };

  const levelInfo = getLevelInfo(points);
  const progressPercent = Math.min(100, (points / levelInfo.max) * 100);

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Legend': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200';
      case 'Foodie': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Explorer': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Kartu Info User */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
            <div className="bg-brand-600 h-24 relative">
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full transition-colors"
                        title="Edit Profil"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                )}
            </div>
            
            <div className="px-6 pb-6 text-center -mt-12">
              <div className="relative inline-block group">
                <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md mx-auto overflow-hidden">
                    <img 
                        src={isEditing && formData.avatarUrl ? formData.avatarUrl : (user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`)} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                )}
                {!isEditing && (
                    <div className="absolute bottom-0 right-0 bg-secondary-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Level">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                )}
              </div>
              
              {isEditing ? (
                  <div className="mt-4 space-y-3 text-left">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-brand-500 focus:border-brand-500"
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Kota Asal</label>
                          <select 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                          >
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Email (Privat)</label>
                          <input 
                            type="text" 
                            value={user.email}
                            disabled
                            className="w-full text-sm border border-gray-200 bg-gray-100 rounded p-2 text-gray-500 cursor-not-allowed"
                          />
                      </div>
                      <div className="flex gap-2 pt-2">
                          <button onClick={handleSave} className="flex-1 bg-brand-600 text-white text-sm py-1.5 rounded hover:bg-brand-700">Simpan</button>
                          <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 text-sm py-1.5 rounded hover:bg-gray-300">Batal</button>
                      </div>
                  </div>
              ) : (
                  <>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-1 mb-4">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-gray-500 text-sm">{user.city || 'Kota Belum Diatur'}</span>
                    </div>

                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(user.level)} mb-6`}>
                        {user.level}
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
                  </>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Statistik & Riwayat */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Statistik Reputasi */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-lg font-bold text-gray-900">Statistik Reputasi</h3>
                        <p className="text-sm text-gray-500">Kumpulkan poin dari ulasan dan upvote untuk naik level!</p>
                     </div>
                     <div className="text-right">
                         <span className="block text-3xl font-bold text-brand-600">{points} <span className="text-base text-gray-500 font-normal">XP</span></span>
                     </div>
                </div>

                {levelInfo.next !== 'Max Level' && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-semibold mb-1 uppercase tracking-wider">
                            <span className="text-brand-600">{levelInfo.current}</span>
                            <span className="text-gray-400">{levelInfo.next}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-linear-to-r from-brand-500 to-secondary-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-xs text-gray-400 mt-1">{points} / {levelInfo.max} XP</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
                        <span className="block text-2xl font-bold text-brand-700">{user.reviewCount}</span>
                        <span className="text-sm text-brand-600">Total Ulasan (+10 XP)</span>
                    </div>
                    <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                        <span className="block text-2xl font-bold text-secondary-700">{user.totalUpvotes}</span>
                        <span className="text-sm text-secondary-600">Total Upvote (+2 XP)</span>
                    </div>
                </div>
            </div>

            {/* Riwayat Ulasan */}
            <div>
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
                                <div className="mt-3 flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                                        <span>{review.likes} Helpful</span>
                                    </div>
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
            </div>

        </div>
      </div>
    </div>
  );
};