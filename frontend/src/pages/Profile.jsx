import React, { useEffect, useState } from "react";
import myPhoto from "../assets/ohim.jpg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Profile = ({ user, onLogout, onUpdateUser, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem("makanKi_token");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    city: user?.city || "",
    avatarUrl: user?.avatarUrl || "",
  });

  // =========================
  // LOGIC & DATA FETCHING (TIDAK DIUBAH)
  // =========================
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) return;
        const updatedUser = {
          ...user,
          id: data.id,
          name: data.name,
          email: data.email,
          city: data.city || "",
          avatarUrl: data.avatarUrl || myPhoto,
          reviewCount: data.reviewCount || 0,
          totalUpvotes: data.totalUpvotes || 0,
          level: data.level || 1, // Asumsi ada field level di DB
          role: data.role || user.role || "user"
        };
        onUpdateUser(prev => ({ ...prev, ...updatedUser }));
        setFormData({
          name: updatedUser.name,
          city: updatedUser.city,
          avatarUrl: updatedUser.avatarUrl
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id || !token) return;
    fetch(`${API_BASE}/reviews/user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, [user?.id, token]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Gagal update profil");
      onUpdateUser({ ...user, ...data });
      setIsEditing(false);
    } catch {
      alert("Gagal terhubung ke server");
    }
  };

  const updateField = (k, v) => setFormData(prev => ({ ...prev, [k]: v }));

  // =========================
  // UI HELPER: RANK SYSTEM
  // =========================
  // Menentukan "Gelar" berdasarkan jumlah review
  const getRankBadge = (count) => {
    if (count >= 50) return { label: "Sultan Kuliner 👑", bg: "bg-gradient-to-r from-yellow-400 to-yellow-600", shadow: "shadow-yellow-200" };
    if (count >= 20) return { label: "Foodie Sepuh 🍜", bg: "bg-gradient-to-r from-purple-500 to-indigo-500", shadow: "shadow-purple-200" };
    if (count >= 5) return { label: "Penjelajah Rasa 🧭", bg: "bg-gradient-to-r from-blue-400 to-cyan-500", shadow: "shadow-blue-200" };
    return { label: "Pencicip Pemula 🥄", bg: "bg-gradient-to-r from-gray-400 to-gray-500", shadow: "shadow-gray-200" };
  };

  const rank = getRankBadge(reviews.length);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* 1. EPIC HERO BANNER */}
      <div className="h-72 w-full bg-gray-900 relative overflow-hidden">
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-rose-500 to-orange-400 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* 2. FLOATING PROFILE CARD */}
        <div className="relative -mt-32 mb-10">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-6 md:p-10 flex flex-col md:flex-row items-start gap-8 md:gap-12 border border-gray-100">
            
            {/* --- AVATAR SECTION --- */}
            <div className="flex-shrink-0 mx-auto md:mx-0 relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-2 bg-white shadow-xl">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-rose-50 relative">
                  <img
                    src={formData.avatarUrl || myPhoto}
                    alt="Profile"
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Edit Overlay */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">Ubah Foto</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Level Badge (Bulat Kecil) */}
              <div className="absolute bottom-4 right-4 bg-gray-900 text-white w-10 h-10 flex items-center justify-center rounded-full border-4 border-white font-bold text-sm shadow-lg z-10" title="Level Pengguna">
                {user.level || "1"}
              </div>
            </div>

            {/* --- INFO & STATS SECTION --- */}
            <div className="flex-1 w-full pt-2 md:pt-4">
              {isEditing ? (
                // MODE EDIT
                <div className="animate-fade-in bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 grid gap-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Edit Informasi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition"
                      placeholder="Nama Lengkap"
                      value={formData.name}
                      onChange={e => updateField("name", e.target.value)}
                    />
                    <input
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition"
                      placeholder="Kota Domisili"
                      value={formData.city}
                      onChange={e => updateField("city", e.target.value)}
                    />
                  </div>
                  <input
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition"
                    placeholder="URL Avatar (https://...)"
                    value={formData.avatarUrl}
                    onChange={e => updateField("avatarUrl", e.target.value)}
                  />
                </div>
              ) : (
                // MODE VIEW
                <div className="text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2 justify-center md:justify-start">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                    
                    {/* Role Badge */}
                    {user.role === 'owner' && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
                        Mitra Restoran
                      </span>
                    )}
                    {user.role === 'admin' && (
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  {/* Rank Badge */}
                  <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg ${rank.bg} ${rank.shadow} mb-6`}>
                    {rank.label}
                  </div>

                  {/* EPIC STATS GRID */}
                  <div className="grid grid-cols-2 gap-4 md:max-w-md">
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 hover:shadow-md transition-all cursor-default group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Total Review</span>
                        <span className="text-xl group-hover:scale-110 transition-transform">🍱</span>
                      </div>
                      <p className="text-3xl font-black text-rose-600">{reviews.length}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 hover:shadow-md transition-all cursor-default group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Total Upvote</span>
                        <span className="text-xl group-hover:scale-110 transition-transform">🔥</span>
                      </div>
                      <p className="text-3xl font-black text-orange-600">{user.totalUpvotes || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex flex-col gap-3 w-full md:w-64 flex-shrink-0">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}
                  className="w-full bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                  Edit Profil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-600">
                    Simpan
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-bold hover:bg-gray-200">
                    Batal
                  </button>
                </div>
              )}

              {!isEditing && (
                <div className="space-y-3 pt-2">
                  {user.role === "user" && (
                    <button onClick={() => onNavigate("register-owner")}
                      className="w-full border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                      Jadi Mitra Restoran
                    </button>
                  )}
                  {user.role === "owner" && (
                    <button onClick={() => onNavigate("owner")}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                      Dashboard Restoran
                    </button>
                  )}
                  <button onClick={onLogout}
                    className="w-full text-rose-500 bg-rose-50 hover:bg-rose-100 px-6 py-3 rounded-xl font-bold transition-colors">
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. REVIEWS COLLECTION */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <span className="bg-rose-100 text-rose-600 p-2 rounded-lg text-xl">📝</span>
               <h2 className="text-2xl font-bold text-gray-800">Review Terbaru Anda</h2>
             </div>
             {/* Hiasan garis */}
             <div className="hidden md:block h-px bg-gray-200 flex-1 ml-6"></div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
              <div className="text-6xl mb-6 opacity-20 animate-bounce">🍽️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada review</h3>
              <p className="text-gray-500">Mulai petualangan kulinermu dan jadilah Sultan Kuliner!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-rose-200 transition-all duration-300 group cursor-default relative overflow-hidden">
                  
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-rose-100 to-transparent -mr-8 -mt-8 rounded-full group-hover:from-rose-200 transition-colors"></div>

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {r.places?.name || "Restoran Tanpa Nama"}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < r.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl relative">
                    <span className="absolute -top-2 -left-1 text-4xl text-gray-200 font-serif">"</span>
                    <p className="text-gray-600 text-sm leading-relaxed relative z-10 italic">
                      {r.comment}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 text-xs font-semibold text-gray-400">
                     <span>Terverifikasi</span>
                     <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
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