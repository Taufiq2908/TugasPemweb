import React, { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import AdminRestaurantCard from "../components/AdminRestaurantCard";

export default function AdminPage({ user, token, onOpenDetail, onAdd }) {
  const [places, setPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH SEMUA RESTO (ADMIN)
  // =========================
  useEffect(() => {
    // 🔥 FIX UTAMA: jangan biarkan loading menggantung
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPlaces = async () => {
      setLoading(true);

      try {
        const data = await apiGet("/admin/places", token);

        // SUPPORT 2 BENTUK RESPONSE
        if (Array.isArray(data)) {
          setPlaces(data);
        } else if (Array.isArray(data?.places)) {
          setPlaces(data.places);
        } else {
          setPlaces([]);
        }
      } catch (err) {
        console.error("Gagal ambil data admin places", err);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [token]);

  // =========================
  // FILTER TAB
  // =========================
  const filteredPlaces = places.filter((p) => {
    if (activeTab === "pending") return p.status === "pending";
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "rejected") return p.status === "rejected";
    return true;
  });

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Restoran</h1>

        <button
          onClick={onAdd}
          className="px-4 py-2 bg-rose-600 text-white rounded"
        >
          + Tambah Restoran
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b mb-6">
        {[
          { key: "all", label: "Semua" },
          { key: "pending", label: "Perlu Verifikasi" },
          { key: "active", label: "Aktif" },
          { key: "rejected", label: "Ditolak" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === tab.key
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : filteredPlaces.length === 0 ? (
        <p className="text-gray-500">Tidak ada data restoran.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => (
            <AdminRestaurantCard
              key={place.id}
              place={place}
              onClick={() => onOpenDetail(place.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
