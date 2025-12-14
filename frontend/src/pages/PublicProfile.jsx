import React, { useEffect, useState } from "react";
import { StarRating } from "../components/StarRating";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const PublicProfile = ({ userId, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // FETCH PROFIL + REVIEW (SATU ENDPOINT)
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

  const getBadgeColor = (level = 1) => {
    if (level >= 5) return "bg-amber-100 text-amber-800";
    if (level >= 4) return "bg-red-100 text-red-700";
    if (level >= 3) return "bg-purple-100 text-purple-700";
    if (level >= 2) return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  // ==============================
  // UI STATES
  // ==============================
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-gray-500">
        Memuat profil pengguna...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-red-600 mb-4">{error || "Profil tidak ditemukan."}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 text-gray-600 hover:text-rose-600"
      >
        ← Kembali
      </button>

      {/* HEADER PROFIL */}
      <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-6 mb-10">
        <img
          src={
            profile.photo_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`
          }
          alt={profile.name}
          className="w-24 h-24 rounded-full border object-cover"
        />

        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(profile.level)}`}
            >
              Level {profile.level}
            </span>

            <span className="px-3 py-1 rounded-full text-xs bg-gray-100">
              {profile.review_count || 0} Ulasan
            </span>
          </div>
        </div>
      </div>

      {/* RIWAYAT REVIEW */}
      <h2 className="text-xl font-bold mb-4">Riwayat Ulasan</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500">Belum ada ulasan.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-5 border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{r.places?.name}</h3>
                <StarRating value={r.rating} size="sm" />
              </div>

              <p className="text-sm text-gray-600">{r.comment}</p>

              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
