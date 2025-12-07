import React, { useEffect, useState } from "react";
import { StarRating } from "../components/StarRating";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const PublicProfile = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // Fetch Data Profile Publik
  // ==============================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${userId}`);

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Gagal memuat profil.");
          setLoading(false);
          return;
        }

        setUser(data.user);
      } catch (err) {
        setError("Tidak dapat terhubung ke server.");
      }
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  const getBadgeColor = (level) => {
    switch (level) {
      case "Legend": return "bg-amber-100 text-amber-800 border-amber-300";
      case "Expert": return "bg-red-100 text-red-800 border-red-200";
      case "Foodie": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Explorer": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="loader mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat profil...</p>
      </div>
    );
  }

  // Error State
  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 font-medium mb-4">{error || "Profil tidak ditemukan."}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-brand-600 mb-6 transition-colors font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali
      </button>

      {/* ==============================
          Header Profil
      =============================== */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="h-32 bg-linear-to-r from-brand-600 to-brand-400"></div>

        <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end -mt-12 gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getBadgeColor(
                  user.level || "User"
                )}`}
              >
                {user.level || "User"}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {user.reviewCount || 0} Ulasan
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                Bergabung {user.joinDate || "Tidak diketahui"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================
          Riwayat Review – sementara dummy
      =============================== */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">Riwayat Ulasan Terbaru</h3>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-900">Restoran Contoh #{i}</h4>
                <span className="text-xs text-gray-500">2 hari yang lalu</span>
              </div>
              <StarRating rating={5} />
            </div>
            <p className="text-gray-600 text-sm">
              "Makanan di sini sangat enak dan pelayanannya memuaskan. Sangat merekomendasikan tempat ini."
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
