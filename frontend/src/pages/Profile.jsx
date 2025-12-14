import React, { useEffect, useState } from "react";
import myPhoto from "../assets/ohim.jpeg";

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
  // LOAD PROFILE (ROLE AMAN)
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
          city: data.city || "Belum diatur",
          avatarUrl: data.avatarUrl || myPhoto,
          reviewCount: data.reviewCount || 0,
          totalUpvotes: data.totalUpvotes || 0,
          joinDate: data.created_at,
          role: data.role || user.role || "user" // 🔒 KUNCI ROLE
        };

        onUpdateUser(prev => ({
          ...prev,
          ...updatedUser
        }));

        setFormData({
          name: updatedUser.name,
          city: updatedUser.city,
          avatarUrl: updatedUser.avatarUrl
        });
      })
      .catch(() => {});
  }, []);

  // =========================
  // LOAD USER REVIEWS (PAKAI TOKEN)
  // =========================
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

  // =========================
  // UPDATE PROFILE
  // =========================
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

      onUpdateUser({
        ...user,
        name: data.name,
        city: data.city,
        avatarUrl: data.avatarUrl
      });

      setIsEditing(false);
    } catch {
      alert("Gagal terhubung ke server");
    }
  };

  const updateField = (k, v) =>
    setFormData(prev => ({ ...prev, [k]: v }));

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-white rounded-2xl p-6 shadow">
        <img
          src={formData.avatarUrl || myPhoto}
          className="w-32 h-32 rounded-full object-cover border-4 border-rose-200"
        />

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.name}
                onChange={e => updateField("name", e.target.value)}
              />
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.city}
                onChange={e => updateField("city", e.target.value)}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Avatar URL"
                value={formData.avatarUrl}
                onChange={e => updateField("avatarUrl", e.target.value)}
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm mt-1">🏙 {user.city}</p>
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-rose-100 text-rose-700">
                Role: {user.role}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="bg-rose-600 text-white px-4 py-2 rounded">
              Edit Profil
            </button>
          ) : (
            <>
              <button onClick={handleSave}
                className="bg-emerald-600 text-white px-4 py-2 rounded">
                Simpan
              </button>
              <button onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded">
                Batal
              </button>
            </>
          )}

          {user.role === "user" && (
            <button
              onClick={() => onNavigate("register-owner")}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Daftar sebagai Pemilik Restoran
            </button>
          )}

          {user.role === "owner" && (
            <button
              onClick={() => onNavigate("owner")}
              className="bg-emerald-600 text-white px-4 py-2 rounded"
            >
              Mode Pemilik Restoran
            </button>
          )}

          <button onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded">
            Keluar
          </button>
        </div>
      </div>

      {/* REVIEW SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Review Saya</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500">Belum ada review.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id}
                className="border rounded-xl p-4 hover:shadow transition">
                <h3 className="font-semibold">{r.places?.name}</h3>
                <p className="text-sm text-gray-600">{r.comment}</p>
                <p className="text-yellow-500 mt-1">⭐ {r.rating}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
