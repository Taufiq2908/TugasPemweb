import React, { useEffect, useState } from "react";
import myPhoto from "../assets/ohim.jpeg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Profile = ({ user, onLogout, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reviews, setReviews] = useState([]);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    city: user?.city || "",
    avatarUrl: user?.avatarUrl || "",
  });

  // ==========================================================
  // 1) LOAD USER PROFILE FROM BACKEND (OVERRIDE mock user)
  // ==========================================================
  useEffect(() => {
    const token = localStorage.getItem("makanKi_token");
    if (!token) return;

    fetch(`${API_BASE}/users/profile`, {
      headers: {
        "Authorization": "Bearer " + token,
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) return;

        const profileData = {
          id: data.id,
          name: data.name,
          email: data.email,
          city: data.city || "Belum diatur",
          avatarUrl: data.avatarUrl || myPhoto,
          reviewCount: data.reviewCount || 0,
          totalUpvotes: data.totalUpvotes || 0,
          joinDate: data.created_at || "Tidak diketahui",
        };

        onUpdateUser(profileData);

        setFormData({
          name: profileData.name,
          city: profileData.city,
          avatarUrl: profileData.avatarUrl,
        });
      })
      .catch(() => {});
  }, []);

  // ==========================================================
  // 2) LOAD USER REVIEWS FROM BACKEND
  // GET /users/:id/reviews
  // ==========================================================
  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API_BASE}/profile/${user.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (data && data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, [user]);

  // ==========================================================
  // UPDATE PROFILE (PUT /users/profile/update)
  // ==========================================================
  const handleSave = async () => {
    const token = localStorage.getItem("makanKi_token");
    if (!token) return alert("Kamu harus login!");

    try {
      const res = await fetch(`${API_BASE}/users/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message || "Gagal memperbarui profil.");

      const updatedUser = {
        ...user,
        name: data.name,
        city: data.city,
        avatarUrl: data.avatarUrl,
      };

      onUpdateUser(updatedUser);
      setIsEditing(false);

    } catch (err) {
      alert("Gagal terhubung dengan server.");
    }
  };

  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // ==========================================================
  // UI — TIDAK DIUBAH SAMA SEKALI
  // ==========================================================
  return (
    <div className="max-w-3xl mx-auto py-8">

      {/* HEADER PROFILE */}
      <div className="flex items-center gap-6 mb-10">
        <img
          src={formData.avatarUrl || user.avatarUrl || myPhoto}
          alt="Avatar"
          className="w-28 h-28 rounded-full border shadow-md object-cover"
        />

        <div>
          {isEditing ? (
            <>
              <input
                className="px-3 py-2 border rounded w-full mb-2"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />

              <input
                className="px-3 py-2 border rounded w-full mb-2"
                value={formData.city}
                placeholder="Kota"
                onChange={(e) => updateField("city", e.target.value)}
              />

              <input
                className="px-3 py-2 border rounded w-full"
                value={formData.avatarUrl}
                placeholder="Avatar URL"
                onChange={(e) => updateField("avatarUrl", e.target.value)}
              />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-700 mt-1">🏙 Kota: {user.city}</p>
            </>
          )}
        </div>

        <div className="ml-auto flex flex-col gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded shadow"
              >
                Simpan
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded shadow"
              >
                Batal
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-rose-600 text-white rounded shadow"
            >
              Edit Profil
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded shadow"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* STATISTIK */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Statistik</h2>

        <p>Total Review: {user.reviewCount || reviews.length}</p>
        <p>Total Upvotes: {user.totalUpvotes || 0}</p>
      </div>

      {/* REVIEW LIST */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Review Saya</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500">Belum ada review.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="p-4 border rounded-lg">
                <p className="font-semibold">{r.place_name}</p>
                <p className="text-gray-600 text-sm">{r.comment}</p>
                <p className="text-yellow-500">⭐ {r.rating}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};
