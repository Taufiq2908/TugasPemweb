import React, { useState, useEffect, useMemo } from "react";
import { StarRating } from "../components/StarRating";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { createClient } from "@supabase/supabase-js";
import { toggleWishlist } from "../utils/wishlist"; // Pastikan import ini benar
import { CITY_MAP } from "../constant/cities";

// =========================
// CONFIG
// =========================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const reviewBucket = import.meta.env.VITE_SUPABASE_REVIEW_BUCKET || "review-photos";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- HELPERS ---
async function uploadReviewImage(file, placeId, userId) {
  if (!supabase) return null;
  const ext = file.name.split(".").pop();
  const filePath = `reviews/${placeId}/${userId || "anon"}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(reviewBucket).upload(filePath, file);
  if (uploadError) throw uploadError;
  const { data: publicData } = supabase.storage.from(reviewBucket).getPublicUrl(filePath);
  return publicData?.publicUrl || null;
}

function mapBackendReview(raw) {
  const isAnon = raw.is_anonymous === true;
  const userName = isAnon ? "Pengguna Anonim" : raw.user_name || raw.users?.name || "Pengguna";
  const avatarUrl = raw.user_avatar_url || raw.users?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;
  return {
    id: raw.id,
    userId: isAnon ? null : (typeof raw.user_id === "object" ? raw.user_id.id ?? null : raw.user_id ?? null),
    userName, userAvatar: avatarUrl, rating: raw.rating, comment: raw.comment,
    isAnonymous: isAnon, date: raw.created_at, likes: raw.thumbs_up_count || 0, photos: raw.photo_urls || []
  };
}

const getFormattedPrice = (data) => {
  if (data.price_range) return data.price_range;
  if (data.price_range_label) return data.price_range_label;
  if (data.min_price != null && data.max_price != null) return `Rp ${Number(data.min_price).toLocaleString('id-ID')} - Rp ${Number(data.max_price).toLocaleString('id-ID')}`;
  return "-";
};

const getFormattedHours = (data) => {
  if (data.opening_hours) return data.opening_hours;
  if (data.business_hours) return data.business_hours;
  if (data.open_time && data.close_time) return `${String(data.open_time).substring(0, 5)} - ${String(data.close_time).substring(0, 5)}`;
  return "-";
};

const getCityName = (place) => {
  if (!place) return "";
  if (place.city_id && CITY_MAP[place.city_id]) return CITY_MAP[place.city_id].name;
  if (place.cities?.name) return place.cities.name;
  if (place.city_name) return place.city_name;
  return "";
};

// =========================
// COMPONENT: SIDEBAR INFO CARD
// =========================
function SidebarInfoCard({ restaurantData, priceDisplay, hoursDisplay, openInMaps, cityName, onToggleWishlist, isSaved }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden sticky top-24">
      {/* Map Preview */}
      <div className="h-48 w-full relative bg-gray-100 group cursor-pointer" onClick={openInMaps}>
        <RestaurantLocationMap restaurant={restaurantData} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
           <span className="bg-white/90 backdrop-blur text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
             Perbesar Peta ↗
           </span>
        </div>
      </div>

      {/* Info Details */}
      <div className="p-6 space-y-5">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-lg flex-shrink-0">📍</div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Alamat</h4>
            <p className="text-sm font-medium text-gray-900 leading-snug">
              {restaurantData.address || "Lokasi belum tersedia"}
              {cityName && `, ${cityName}`}
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-lg flex-shrink-0">🕒</div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Jam Buka</h4>
            <p className="text-sm font-bold text-gray-900">{hoursDisplay}</p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-lg flex-shrink-0">💵</div>
          <div>
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Harga</h4>
             <p className="text-sm font-bold text-gray-900">{priceDisplay}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button 
            onClick={openInMaps}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            🗺️ Buka Google Maps
          </button>

          {/* Tombol Wishlist Sidebar */}
          <button 
            onClick={onToggleWishlist}
            className={`w-full py-3 rounded-xl font-bold text-sm border transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95 ${
              isSaved 
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-inner" 
              : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {isSaved ? (
              <>❤️ Tersimpan di Favorit</>
            ) : (
              <>♡ Simpan ke Favorit</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================
// MAIN COMPONENT
// =========================
export const RestaurantDetail = ({
  restaurant, reviews: initialReviews = [], isFavorite, onToggleFavorite, onBack, onUserClick, user, onAuthRequest,
}) => {
  const [place, setPlace] = useState(restaurant || null);
  const [localReviews, setLocalReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // State Lokal Wishlist (Instant Feedback)
  const [isSaved, setIsSaved] = useState(isFavorite);

  // Review Form
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const placeId = restaurant?.id;

  // Sync prop 'isFavorite' jika berubah dari luar
  useEffect(() => {
    setIsSaved(isFavorite);
  }, [isFavorite]);

  useEffect(() => {
    if (!placeId) return;
    fetch(`${API_BASE}/places/${placeId}`).then(res => res.json()).then(data => setPlace(data)).catch(() => {});
    setLoadingReviews(true);
    fetch(`${API_BASE}/reviews/place/${placeId}`)
      .then(res => res.json())
      .then(data => setLocalReviews((data || []).map(mapBackendReview)))
      .catch(() => setLocalReviews((initialReviews || []).map(r => ({ ...r, likes: r.likes || 0 }))))
      .finally(() => setLoadingReviews(false));
  }, [placeId]);

  const restaurantData = place || restaurant || {};
  const reviewStats = useMemo(() => {
    const count = localReviews.length;
    if (!count) return { average: restaurantData.average_rating || 0, count: restaurantData.review_count || 0 };
    const total = localReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return { average: total / count, count };
  }, [localReviews, restaurantData]);

  const priceDisplay = getFormattedPrice(restaurantData);
  const hoursDisplay = getFormattedHours(restaurantData);
  const cityName = getCityName(restaurantData);
  const mainPhoto = restaurantData.photos?.[0] || restaurantData.image_url || "/placeholder.jpg";
  const displayRating = (reviewStats.average || 0).toFixed(1);

  // --- HANDLER WISHLIST ---
  const handleToggleWishlist = async () => {
    if (!user) {
      if (onAuthRequest) onAuthRequest();
      else alert("Silakan login untuk menyimpan restoran ini.");
      return;
    }

    // Optimistic Update
    const newState = !isSaved;
    setIsSaved(newState);

    try {
      const result = await toggleWishlist(user.id, restaurantData.id, isSaved);
      if (result.success) {
        if (onToggleFavorite) onToggleFavorite(restaurantData.id);
      } else {
        // Revert jika gagal
        setIsSaved(!newState);
        console.error("Gagal update wishlist:", result.message);
      }
    } catch (err) {
      setIsSaved(!newState);
      console.error("Error wishlist:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitError(""); setSubmitSuccess("");
    if (!user) return onAuthRequest && onAuthRequest();
    if (!newRating) return setSubmitError("Wajib beri bintang ⭐");
    if (newComment.trim().length < 5) return setSubmitError("Tulis ulasan minimal 5 karakter.");

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("makanKi_token");
      if (!token) throw new Error("Silakan login.");
      let photoUrls = [];
      if (mediaFile) {
        const url = await uploadReviewImage(mediaFile, placeId, user.id);
        if (url) photoUrls = [url];
      }
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.id, place_id: placeId, rating: newRating, comment: newComment.trim(), is_anonymous: isAnonymous, photo_urls: photoUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal.");
      setLocalReviews(prev => [mapBackendReview(data.review), ...prev]);
      setSubmitSuccess("Terkirim!");
      setNewRating(0); setNewComment(""); setMediaFile(null); setMediaPreviewUrl(null);
    } catch (err) { setSubmitError(err.message); } finally { setSubmittingReview(false); }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return onAuthRequest && onAuthRequest();
    const token = localStorage.getItem("makanKi_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/review-likes/${reviewId}/like`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
      setLocalReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));
    } catch (e) {}
  };

  const openInMaps = () => {
    const { google_maps_url, lat, lng, address } = restaurantData;
    if (google_maps_url) window.open(google_maps_url, "_blank");
    else if (lat && lng) window.open(`http://maps.google.com/maps?q=${lat},${lng}`, "_blank");
    else if (address) window.open(`http://maps.google.com/maps?q=${encodeURIComponent(address)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-20">
      
      {/* 1. NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-rose-600 transition">
            ← Kembali
          </button>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={handleToggleWishlist}
               className={`px-4 py-2 rounded-full font-bold text-sm border transition flex items-center gap-2 ${isSaved ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
             >
               {isSaved ? "❤️ Tersimpan" : "♡ Simpan"}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* 2. SPLIT HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-[45%_1fr] gap-8 lg:gap-12 mb-12">
           
           {/* IMAGE (LEFT) */}
           <div className="h-[300px] md:h-[400px] lg:h-[450px] w-full rounded-3xl overflow-hidden shadow-xl bg-gray-100 relative group border border-gray-200">
              <img 
                src={mainPhoto} 
                alt="Main" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
           </div>

           {/* HEADER INFO (RIGHT) */}
           <div className="flex flex-col justify-center space-y-6">
              
              {/* Categories & City */}
              <div className="flex flex-wrap gap-2">
                 {(restaurantData.categories || []).map((cat, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {cat.name || cat}
                    </span>
                 ))}
                 {cityName && (
                   <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                     {cityName}
                   </span>
                 )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {restaurantData.name}
              </h1>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                 <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                    <StarRating value={Number(displayRating)} size="md" />
                    <span className="text-lg font-bold text-gray-900 ml-1">{displayRating}</span>
                    <span className="text-gray-500">({reviewStats.count} review)</span>
                 </div>
                 
                 <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-green-700 font-bold">
                    <span>💵</span>
                    <span>{priceDisplay}</span>
                 </div>
              </div>

           </div>
        </div>

        {/* 3. CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">
           
           {/* === LEFT CONTENT === */}
           <div className="space-y-12">
              
              {/* Description */}
              <div>
                 <h3 className="text-xl font-bold text-gray-900 mb-4">Tentang Tempat Ini</h3>
                 <div className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed">
                   <p>{restaurantData.description || "Belum ada deskripsi lengkap."}</p>
                 </div>
              </div>

              {/* MOBILE ONLY: INFO CARD */}
              <div className="block lg:hidden">
                 <SidebarInfoCard 
                    restaurantData={restaurantData}
                    priceDisplay={priceDisplay}
                    hoursDisplay={hoursDisplay}
                    openInMaps={openInMaps}
                    cityName={cityName}
                    onToggleWishlist={handleToggleWishlist}
                    isSaved={isSaved}
                 />
              </div>

              {/* Reviews */}
              <div className="pt-8 border-t border-gray-100">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Ulasan & Foto</h3>
                 </div>

                 {/* Write Review */}
                 <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 mb-10">
                    <form onSubmit={handleSubmitReview}>
                       <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Rating</label>
                          <StarRating value={newRating} onChange={setNewRating} interactive size="lg" />
                       </div>
                       <div className="mb-4">
                          <textarea 
                             className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition resize-none shadow-sm"
                             rows={3}
                             placeholder="Ceritakan detail pengalamanmu..."
                             value={newComment}
                             onChange={e => setNewComment(e.target.value)}
                          />
                       </div>
                       <div className="flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                             <label className="cursor-pointer flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition">
                                📷 <span>Upload Foto</span>
                                <input type="file" className="hidden" accept="image/*" onChange={e => {if(e.target.files[0]) {setMediaFile(e.target.files[0]); setMediaPreviewUrl(URL.createObjectURL(e.target.files[0]));}}}/>
                             </label>
                             <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer font-bold">
                                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500"/>
                                Anonim
                             </label>
                          </div>
                          <button disabled={submittingReview} className="bg-gray-900 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition disabled:opacity-50">
                             {submittingReview ? "..." : "Kirim"}
                          </button>
                       </div>
                       {mediaPreviewUrl && <div className="mt-3 relative w-fit"><img src={mediaPreviewUrl} className="h-16 rounded-lg border"/><button type="button" onClick={()=>setMediaPreviewUrl(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✕</button></div>}
                       {submitError && <p className="text-red-500 text-xs mt-2 font-bold">{submitError}</p>}
                       {submitSuccess && <p className="text-green-500 text-xs mt-2 font-bold">{submitSuccess}</p>}
                    </form>
                 </div>

                 {/* Reviews List */}
                 <div className="space-y-8">
                    {loadingReviews ? <p className="text-center text-gray-400">Memuat...</p> : localReviews.map(review => (
                       <div key={review.id} className="flex gap-4">
                          <img src={review.userAvatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                          <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <div>
                                   <h4 className="font-bold text-gray-900 text-sm">{review.userName}</h4>
                                   <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                                </div>
                                <StarRating value={review.rating} size="sm" />
                             </div>
                             <p className="text-gray-700 text-sm leading-relaxed mb-3 mt-2">{review.comment}</p>
                             {review.photos.length > 0 && <div className="flex gap-2 mb-3">{review.photos.map((u,i)=><img key={i} src={u} className="w-24 h-24 rounded-lg object-cover border shadow-sm cursor-zoom-in"/>)}</div>}
                             <button onClick={()=>handleLikeReview(review.id)} className="text-xs font-bold text-gray-400 hover:text-rose-600 transition flex items-center gap-1">👍 Membantu ({review.likes})</button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* === RIGHT: SIDEBAR (DESKTOP) === */}
           <div className="hidden lg:block h-full">
              <SidebarInfoCard 
                 restaurantData={restaurantData}
                 priceDisplay={priceDisplay}
                 hoursDisplay={hoursDisplay}
                 openInMaps={openInMaps}
                 cityName={cityName}
                 onToggleWishlist={handleToggleWishlist}
                 isSaved={isSaved}
              />
           </div>

        </div>
      </div>
    </div>
  );
};

// --- GOOGLE MAP ---
function RestaurantLocationMap({ restaurant }) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY });
  if (!isLoaded || !restaurant?.lat || !restaurant?.lon) return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Peta Offline</div>;
  return (
    <GoogleMap 
      mapContainerStyle={{ width: "100%", height: "100%" }} 
      center={{ lat: Number(restaurant.lat), lng: Number(restaurant.lon) }} 
      zoom={15} 
      options={{ disableDefaultUI: true, zoomControl: false, draggable: false }}
    >
      <Marker position={{ lat: Number(restaurant.lat), lng: Number(restaurant.lon) }} />
    </GoogleMap>
  );
}