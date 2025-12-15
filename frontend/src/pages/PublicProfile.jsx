import React, { useEffect, useState } from "react";
import { StarRating } from "../components/StarRating";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const PublicProfile = ({ userId, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // FETCH PROFIL + REVIEW
  // ==============================
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile/${userId}/reviews`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Profil tidak ditemukan.");
          setLoading(false);
          return;
        }

        setProfile(data.profile);
        setReviews(data.reviews || []);
      } catch (err) {
        setError("Gagal terhubung ke server.");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  // ==============================
  // UI HELPER: RANK BADGE & LEVEL
  // ==============================
  const getRankInfo = (level = 1) => {
    if (level >= 50) return { label: "Sultan Kuliner 👑", bg: "bg-gradient-to-r from-yellow-400 to-yellow-600", shadow: "shadow-yellow-200" };
    if (level >= 20) return { label: "Foodie Sepuh 🍜", bg: "bg-gradient-to-r from-purple-500 to-indigo-500", shadow: "shadow-purple-200" };
    if (level >= 5) return { label: "Penjelajah Rasa 🧭", bg: "bg-gradient-to-r from-blue-400 to-cyan-500", shadow: "shadow-blue-200" };
    return { label: "Pencicip Pemula 🥄", bg: "bg-gradient-to-r from-gray-400 to-gray-500", shadow: "shadow-gray-200" };
  };

  // ==============================
  // LOADING & ERROR STATES
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Sedang mengintip profil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="text-6xl mb-4 grayscale opacity-30">🕵️‍♂️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-red-500 mb-6">{error || "Profil tidak ditemukan."}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition shadow-lg"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Hitung level/rank (fallback ke 1 jika data tidak ada)
  const userLevel = profile.level || 1;
  const rank = getRankInfo(userLevel);

  // ==============================
  // RENDER UTAMA
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* 1. HERO BANNER */}
      <div className="h-64 w-full bg-gray-900 relative overflow-hidden">
        {/* Gradient Background (Warna Sedikit Beda dari Profile Pribadi biar variasi) */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 opacity-95"></div>
        
        {/* Pattern Dots */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2 z-20"
        >
          ← Kembali
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* 2. FLOATING PROFILE CARD */}
        <div className="relative -mt-24 mb-10">
          <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 border border-gray-100">
            
            {/* Avatar Section */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white shadow-xl">
                <img
                  src={
                    profile.photo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`
                  }
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover border-2 border-gray-100"
                />
              </div>
              {/* Level Badge Circle */}
              <div className="absolute bottom-2 right-2 bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-full border-2 border-white font-bold text-xs shadow-md" title={`Level Pengguna`}>
                {userLevel}
              </div>
            </div>

            {/* Info User */}
            <div className="flex-1 text-center md:text-left w-full">
              <h1 className="text-3xl font-black text-gray-900 mb-2">{profile.name}</h1>
              
              {/* Rank Badge */}
              <div className={`inline-flex items-center px-4 py-1 rounded-full text-white text-xs font-bold shadow-md mb-6 ${rank.bg} ${rank.shadow}`}>
                {rank.label}
              </div>

              {/* EPIC STATS GRID (Updated) */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0">
                {/* Total Review */}
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 group hover:shadow-md transition-all cursor-default">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="text-lg group-hover:scale-110 transition-transform">🍱</span>
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Total Review</span>
                  </div>
                  <p className="text-3xl font-black text-rose-600">{profile.review_count || 0}</p>
                </div>
                
                {/* Total Upvote */}
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 group hover:shadow-md transition-all cursor-default">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="text-lg group-hover:scale-110 transition-transform">🔥</span>
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Total Upvote</span>
                  </div>
                  <p className="text-3xl font-black text-orange-600">{profile.total_upvotes || 0}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. REVIEW COLLECTION */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="h-8 w-1 bg-rose-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Riwayat Kuliner</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4 grayscale opacity-20">🍽️</div>
              <p className="text-gray-400 text-lg font-medium">Pengguna ini belum menulis ulasan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map((r) => (
                <div 
                  key={r.id} 
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Decorative Blob */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:bg-rose-100 transition-colors"></div>

                  {/* Header Card */}
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1 pr-4">
                      {r.places?.name || "Lokasi Tidak Diketahui"}
                    </h3>
                    <div className="flex-shrink-0 bg-yellow-50 px-2 py-1 rounded-lg">
                      <StarRating value={r.rating} size="sm" />
                    </div>
                  </div>

                  {/* Comment Body */}
                  <div className="bg-gray-50 p-3 rounded-xl mb-3 relative z-10">
                    <p className="text-gray-600 text-sm leading-relaxed italic line-clamp-3">
                      "{r.comment}"
                    </p>
                  </div>

                  {/* Footer Card */}
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium relative z-10">
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>
                        {new Date(r.created_at).toLocaleDateString("id-ID", {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                       ✅ Terverifikasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};