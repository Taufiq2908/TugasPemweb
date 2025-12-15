import React, { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import AdminRestaurantCard from "../components/AdminRestaurantCard";

export default function AdminPage({ user, token, onOpenDetail, onAdd, onLogout }) {
  const [places, setPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH SEMUA RESTO (LOGIC TETAP)
  // =========================
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const data = await apiGet("/admin/places", token);
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
  // FILTER TAB & STATS
  // =========================
  const filteredPlaces = places.filter((p) => {
    if (activeTab === "pending") return p.status === "pending";
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "rejected") return p.status === "rejected";
    return true;
  });

  // Hitung statistik sederhana untuk badge di tab
  const stats = {
    all: places.length,
    pending: places.filter(p => p.status === 'pending').length,
    active: places.filter(p => p.status === 'active').length,
    rejected: places.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 1. TOPBAR (Header Admin) */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gray-900 text-white p-2 rounded-lg font-black text-lg tracking-tighter">
              MK
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Kelola Restoran & Mitra</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{user?.email || "admin@makanki.com"}</p>
            </div>
            <button 
              onClick={onLogout}
              className="text-xs font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-lg hover:bg-rose-100 transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* 2. PAGE HEADER & ACTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Daftar Restoran</h2>
            <p className="text-gray-500 text-sm mt-1">Pantau dan verifikasi restoran yang mendaftar.</p>
          </div>
          <button
            onClick={onAdd}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition flex items-center gap-2"
          >
            <span>+</span> Tambah Manual
          </button>
        </div>

        {/* 3. MODERN TABS */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
          {[
            { key: "all", label: "Semua", color: "bg-gray-100 text-gray-600" },
            { key: "pending", label: "Perlu Verifikasi", color: "bg-yellow-100 text-yellow-700" },
            { key: "active", label: "Aktif", color: "bg-green-100 text-green-700" },
            { key: "rejected", label: "Ditolak", color: "bg-red-100 text-red-700" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ml-1 ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {stats[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* 4. CONTENT GRID */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-rose-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Memuat data restoran...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4 grayscale opacity-20">📂</div>
            <h3 className="text-lg font-bold text-gray-900">Belum ada data</h3>
            <p className="text-gray-500 text-sm mt-1">Tidak ada restoran di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
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
    </div>
  );
}