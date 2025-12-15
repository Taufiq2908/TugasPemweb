import React, { useEffect, useState } from "react";
import { apiGet, apiPut } from "../services/api"; // Hapus apiPost jika tidak dipakai

export default function AdminRestaurantDetail({ restaurantId, onBack }) {
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("makanKi_token");

  // =========================
  // FETCH DETAIL RESTO (ADMIN)
  // =========================
  useEffect(() => {
    if (!restaurantId || !token) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/admin/places/${restaurantId}`, token);
        setPlace(data.place ?? data);
      } catch (err) {
        console.error("Gagal ambil detail resto:", err);
        setPlace(null);
      }
      setLoading(false);
    };

    fetchDetail();
  }, [restaurantId, token]);

  // =========================
  // ACTIONS
  // =========================
  const activate = async () => {
    if(!window.confirm("Aktifkan restoran ini?")) return;
    await apiPut(`/admin/places/${restaurantId}/approve`, {}, token);
    onBack();
  };

  const reject = async () => {
    if(!window.confirm("Tolak restoran ini?")) return;
    await apiPut(`/admin/places/${restaurantId}/reject`, {}, token);
    onBack();
  };

  const save = async () => {
    const body = {
      name: place.name?.trim(),
      description: place.description?.trim(),
      address: place.address?.trim(),
      city_id: Number(place.city_id),
      lat: place.lat !== null ? Number(place.lat) : null,
      lon: place.lon !== null ? Number(place.lon) : null,
      opening_hours: place.opening_hours?.trim(),
      price_range: place.price_range?.trim(),
      photos: Array.isArray(place.photos) ? place.photos : [],
    };

    try {
        await apiPut(`/admin/places/${restaurantId}`, body, token);
        alert("Perubahan berhasil disimpan");
    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan perubahan");
    }
  };

  // =========================
  // UI: LOADING & ERROR STATES
  // =========================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 animate-pulse">
        <svg className="w-10 h-10 mb-3 animate-spin text-rose-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-medium">Memuat data restoran...</span>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Gagal Memuat Data</h3>
        <p className="text-red-600 mb-6">Terjadi kesalahan saat mengambil data restoran.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
        >
          ← Kembali ke Daftar
        </button>
      </div>
    );
  }

  // =========================
  // UI: MAIN FORM
  // =========================
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform mr-1">←</span>
            Kembali ke Admin
          </button>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Detail Restoran</h2>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(place.status)}`}>
          <span className="uppercase tracking-wide">{place.status || "Unknown"}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {/* Form Content */}
        <div className="p-6 sm:p-8 space-y-6">
            
            {/* Group: Identity */}
            <div className="grid grid-cols-1 gap-6">
                <Field label="Nama Restoran">
                    <input
                    value={place.name || ""}
                    onChange={(e) => setPlace({ ...place, name: e.target.value })}
                    className="form-input"
                    placeholder="Contoh: Warung Makan Bahari"
                    />
                </Field>

                <Field label="Alamat Lengkap">
                    <textarea
                    rows={2}
                    value={place.address || ""}
                    onChange={(e) => setPlace({ ...place, address: e.target.value })}
                    className="form-input resize-none"
                    placeholder="Alamat lengkap restoran..."
                    />
                </Field>
            </div>

            <hr className="border-gray-100" />

            {/* Group: Location */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Lokasi (Peta)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Latitude">
                        <input
                        type="number"
                        value={place.lat ?? ""}
                        onChange={(e) => setPlace({ ...place, lat: e.target.value })}
                        className="form-input font-mono text-sm"
                        placeholder="-5.147..."
                        />
                    </Field>

                    <Field label="Longitude">
                        <input
                        type="number"
                        value={place.lon ?? ""}
                        onChange={(e) => setPlace({ ...place, lon: e.target.value })}
                        className="form-input font-mono text-sm"
                        placeholder="119.432..."
                        />
                    </Field>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Group: Details */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Informasi Tambahan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Field label="Jam Operasional">
                        <input
                        value={place.opening_hours || ""}
                        onChange={(e) => setPlace({ ...place, opening_hours: e.target.value })}
                        className="form-input"
                        placeholder="e.g. 09:00 - 22:00"
                        />
                    </Field>

                    <Field label="Rentang Harga">
                        <input
                        value={place.price_range || ""}
                        onChange={(e) => setPlace({ ...place, price_range: e.target.value })}
                        className="form-input"
                        placeholder="e.g. 20k - 50k"
                        />
                    </Field>
                </div>

                <Field label="Deskripsi">
                    <textarea
                    value={place.description || ""}
                    onChange={(e) => setPlace({ ...place, description: e.target.value })}
                    className="form-input min-h-[120px]"
                    placeholder="Ceritakan tentang restoran ini..."
                    />
                </Field>
            </div>
        </div>

        {/* Action Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3">
            <button
                onClick={save}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
            >
                Simpan Perubahan
            </button>

            <div className="w-px h-6 bg-gray-300 hidden sm:block mx-1"></div>

            {place.status !== "rejected" && (
                <button
                onClick={reject}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-300 focus:ring-4 focus:ring-red-100 transition-all shadow-sm"
                >
                Tolak
                </button>
            )}

            {place.status !== "active" && (
                <button
                onClick={activate}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all shadow-md"
                >
                ✓ Setujui & Aktifkan
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

// =========================
// UI HELPERS & COMPONENTS
// =========================

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {/* Kita clone element anak untuk menambahkan styling default jika itu adalah input/textarea standar */}
      {React.Children.map(children, (child) => {
         // Cek apakah element valid sebelum clone
         if (React.isValidElement(child)) {
             // Gabungkan class bawaan dengan class tailwind baru
             const existingClass = child.props.className || "";
             // Jika belum ada class 'form-input' (custom flag), kita tambahkan styling default
             if (!existingClass.includes('form-input')) {
                return React.cloneElement(child, {
                    className: `${existingClass} w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm py-2.5 px-3 border transition-colors`.trim()
                });
             }
         }
         return child;
      })}
      {/* Catatan: Saya menambahkan class CSS khusus di bawah ini 
        untuk menangkap className="form-input" yang saya tulis di atas 
      */}
      <style>{`
        .form-input {
            width: 100%;
            border-radius: 0.5rem; /* rounded-lg */
            border: 1px solid #d1d5db; /* border-gray-300 */
            padding: 0.625rem 0.75rem; /* py-2.5 px-3 */
            font-size: 0.875rem; /* text-sm */
            transition: all 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: #e11d48; /* rose-600 */
            box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1); /* ring-rose */
        }
      `}</style>
    </div>
  );
}

// Helper untuk warna badge status
function getStatusColor(status) {
    switch (status) {
        case 'active':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'rejected':
            return 'bg-red-50 text-red-700 border-red-200';
        case 'pending':
        default:
            return 'bg-amber-50 text-amber-700 border-amber-200';
    }
}