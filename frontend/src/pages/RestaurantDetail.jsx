import React, { useState } from 'react';
import { StarRating } from '../components/StarRating';

export const RestaurantDetail = ({ 
  restaurant, 
  reviews: initialReviews, 
  isFavorite, 
  onToggleFavorite, 
  onBack,
  onUserClick,
  user,           // <-- Props Baru (Data User)
  onAuthRequest   // <-- Props Baru (Fungsi Login)
}) => {
  const [localReviews, setLocalReviews] = useState(initialReviews);
  
  // State Form
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);

  // Fungsi Share
  const handleShare = async () => {
    const shareData = {
      title: `Makan Ki' - ${restaurant.name}`,
      text: `Coba cek restoran ${restaurant.name} ini! Rating: ${restaurant.rating} bintang.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    // Validasi Ganda (Jaga-jaga)
    if (!user) {
        onAuthRequest();
        return;
    }

    if (newRating === 0) {
        alert("Mohon berikan rating bintang!");
        return;
    }

    const newReview = {
        id: `new-${Date.now()}`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        // Gunakan nama user yang login, atau 'Anda' jika error, atau 'Anonim' jika dicentang
        user: isAnonymous ? 'Pengguna Anonim' : (user.name || 'Anda'),
        userLevel: isAnonymous ? undefined : (user.level || 'Explorer'), 
        rating: newRating,
        comment: newComment,
        date: new Date().toLocaleDateString('id-ID'),
        likes: 0,
        dislikes: 0,
        isAnonymous: isAnonymous,
        mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : undefined
    };

    setLocalReviews([newReview, ...localReviews]);
    setNewComment('');
    setNewRating(0);
    setMediaFile(null);
    setIsAnonymous(false);
  };

  const handleVote = (id, type) => {
    setLocalReviews(prev => prev.map(r => {
        if (r.id === id) {
            return {
                ...r,
                likes: type === 'like' ? r.likes + 1 : r.likes,
                dislikes: type === 'dislike' ? r.dislikes + 1 : r.dislikes
            };
        }
        return r;
    }));
  };

  const getBadgeStyle = (level) => {
    if (!level) return 'hidden';
    switch (level) {
      case 'Legend': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200';
      case 'Foodie': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Explorer': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Newbie': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'hidden';
    }
  };

  return (
    <div className="py-6 animate-fade-in-up relative">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-up">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-medium text-sm">Link berhasil disalin!</span>
        </div>
      )}

      {/* Navigation */}
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
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hero Section */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg group">
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute top-4 right-4 z-10 flex gap-2">
               {/* Share Button */}
               <button
                onClick={handleShare}
                className="p-3 rounded-full backdrop-blur-md shadow-lg border border-white/20 bg-black/40 text-white hover:bg-black/60 transition-all transform hover:scale-110 active:scale-95"
                title="Bagikan"
              >
                <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

               {/* Wishlist Button */}
               <button
                onClick={() => onToggleFavorite(restaurant.id)}
                className={`p-3 rounded-full backdrop-blur-md shadow-lg border border-white/20 ${
                  isFavorite ? 'bg-brand-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                } transition-all transform hover:scale-110 active:scale-95`}
                title={isFavorite ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
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

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 sm:p-8">
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

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Restoran</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {restaurant.description}
            </p>
          </div>

          {/* --- LOGIKA TAMPILAN FORM REVIEW --- */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tulis Ulasan Anda</h3>
            
            {/* Jika User Login -> Tampilkan Form */}
            {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex cursor-pointer">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    onClick={() => setNewRating(star)}
                                    className={`w-8 h-8 transition-colors ${star <= newRating ? 'text-secondary-500' : 'text-gray-300 hover:text-secondary-400'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Bagaimana pengalaman makan Anda? (Rasa, Pelayanan, Suasana)"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[100px]"
                        required
                    />

                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>{mediaFile ? mediaFile.name : 'Tambah Foto'}</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => e.target.files && setMediaFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                />
                                Kirim sebagai Anonim
                            </label>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition font-medium"
                        >
                            Kirim Ulasan
                        </button>
                    </div>
                </form>
            ) : (
                // Jika Guest -> Tampilkan Pesan Login
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="text-4xl mb-3">🔒</div>
                    <h4 className="text-gray-800 font-bold mb-2">Ingin membagikan pengalaman Anda?</h4>
                    <p className="text-gray-500 text-sm mb-6">Silakan masuk ke akun Anda untuk menulis ulasan, memberi rating, dan berbagi foto.</p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={onAuthRequest} 
                            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 font-medium transition shadow-lg shadow-brand-500/20"
                        >
                            Masuk Sekarang
                        </button>
                    </div>
                </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Ulasan Komunitas
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{localReviews.length}</span>
            </h2>
            
            <div className="space-y-8">
                {localReviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 pt-1">
                            <button 
                                onClick={() => handleVote(review.id, 'like')}
                                className="text-gray-400 hover:text-brand-600 hover:bg-brand-50 p-1 rounded transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <span className="text-sm font-bold text-gray-700">
                                {review.likes - review.dislikes}
                            </span>
                            <button 
                                onClick={() => handleVote(review.id, 'dislike')}
                                className="text-gray-400 hover:text-brand-600 hover:bg-brand-50 p-1 rounded transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                                         <img 
                                            src={review.isAnonymous ? "https://ui-avatars.com/api/?name=Anon&background=gray" : `https://ui-avatars.com/api/?name=${review.user}&background=random`} 
                                            alt={review.user}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {review.isAnonymous ? (
                                                <span className="font-semibold text-gray-900 text-sm">Anonim</span>
                                            ) : (
                                                <button 
                                                    onClick={() => onUserClick && onUserClick(review.user)}
                                                    className="font-semibold text-gray-900 text-sm hover:underline hover:text-brand-600 cursor-pointer"
                                                >
                                                    {review.user}
                                                </button>
                                            )}
                                            
                                            {!review.isAnonymous && review.userLevel && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getBadgeStyle(review.userLevel)}`}>
                                                    {review.userLevel}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">{review.date}</span>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>
                            
                            <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                {review.comment}
                            </p>

                            {review.mediaUrl && (
                                <div className="mt-3">
                                    <img 
                                        src={review.mediaUrl} 
                                        alt="Review attachment" 
                                        className="rounded-lg max-h-48 object-cover border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
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
                    href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white text-center py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/30 transform hover:-translate-y-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    Arahkan Saya
                </a>
             </div>
        </div>
      </div>
    </div>
  );
};