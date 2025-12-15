import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPut } from "../services/api";
import { CITY_MAP } from "../constant/cities";

export default function OwnerRestaurantDetail({
  restaurantId,
  token,
  onBack
}) {
  const [place, setPlace] = useState(null);
  const [original, setOriginal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const cityList = useMemo(() => Object.values(CITY_MAP || {}), []);

  // =========================
  // LOAD DATA RESTO OWNER
  // =========================
  useEffect(() => {
    if (!restaurantId || !token) return;

    const load = async () => {
      const res = await apiGet(`/owner/places/${restaurantId}`, token);

      if (res?.error) {
        alert(res.error);
        return;
      }

      // backend return { place } atau langsung object
      const data = res.place ?? res;

      setPlace(data);
      setOriginal(data);
    };

    load();
  }, [restaurantId, token]);

  // =========================
  // LOGIC HELPERS
  // =========================
  const update = (key, value) =>
    setPlace((prev) => ({ ...prev, [key]: value }));

  // Helper untuk mengubah array photos menjadi string (untuk textarea)
  // Dipindahkan ke variable agar aman saat render
  const photosText = place && Array.isArray(place.photos)
    ? place.photos.join("\n")
    : "";

  const handleSave = async () => {
    if (!token) {
      alert("Token tidak ada. Silakan login ulang.");
      return;
    }

    const body = {
      name: (place.name || "").trim(),
      description: (place.description || "").trim(),
      address: (place.address || "").trim(),
      city_id: Number(place.city_id),
      lat: Number(place.lat),
      lon: Number(place.lon),
      opening_hours: (place.opening_hours || "").trim(),
      price_range: (place.price_range || "").trim(),
      photos: Array.isArray(place.photos) ? place.photos : []
    };

    if (!body.name || !body.address || !body.city_id) {
      alert("Nama, alamat, dan kota wajib diisi.");
      return;
    }

    if (Number.isNaN(body.lat) || Number.isNaN(body.lon)) {
      alert("Latitude dan Longitude harus berupa angka.");
      return;
    }

    setIsSaving(true);
    const res = await apiPut(
      `/owner/places/${restaurantId}`,
      body,
      token
    );
    setIsSaving(false);

    if (res?.error) {
      alert(res.error);
      return;
    }

    alert("Perubahan disimpan dan menunggu verifikasi admin.");
    onBack();
  };

  const handleCancel = () => {
    setPlace(original);
  };

  // =========================
  // UI: LOADING STATE
  // =========================
  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <svg className="w-10 h-10 mb-3 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-medium">Memuat data restoran...</span>
      </div>
    );
  }

  // =========================
  // UI: MAIN FORM
  // =========================
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <button
                onClick={onBack}
                className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
            >
                <span className="transform group-hover:-translate-x-1 transition-transform mr-1">←</span>
                Kembali
            </button>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Restoran</h2>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm ${getStatusColor(place.status)}`}>
             Status: <span className="uppercase tracking-wide ml-1">{place.status || "Unknown"}</span>
        </div>
      </div>

      {/* CARD CONTAINER */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        
        {/* FORM CONTENT */}
        <div className="p-6 sm:p-8 space-y-8">
            
            {/* GROUP 1: IDENTITAS */}
            <div className="space-y-6">
                <Field label="Nama Restoran">
                    <input
                        value={place.name || ""}
                        onChange={(e) => update("name", e.target.value)}
                        className="form-input"
                        placeholder="Nama restoran anda"
                    />
                </Field>

                <Field label="Deskripsi">
                    <textarea
                        value={place.description || ""}
                        onChange={(e) => update("description", e.target.value)}
                        className="form-input min-h-[100px]"
                        placeholder="Deskripsikan keunggulan restoran..."
                    />
                </Field>
            </div>

            <hr className="border-gray-100" />

            {/* GROUP 2: LOKASI */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Lokasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Field label="Alamat Lengkap">
                            <input
                                value={place.address || ""}
                                onChange={(e) => update("address", e.target.value)}
                                className="form-input"
                                placeholder="Jalan, Nomor, Kelurahan..."
                            />
                        </Field>
                    </div>

                    <Field label="Kota">
                        <select
                            value={place.city_id ?? ""}
                            onChange={(e) => update("city_id", Number(e.target.value))}
                            className="form-input"
                        >
                            <option value="" disabled>-- Pilih Kota --</option>
                            {cityList.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Latitude">
                            <input
                                type="number"
                                value={place.lat ?? ""}
                                onChange={(e) => update("lat", e.target.value)}
                                className="form-input font-mono text-sm"
                            />
                        </Field>
                        <Field label="Longitude">
                            <input
                                type="number"
                                value={place.lon ?? ""}
                                onChange={(e) => update("lon", e.target.value)}
                                className="form-input font-mono text-sm"
                            />
                        </Field>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* GROUP 3: DETAIL */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detail Operasional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Jam Operasional">
                        <input
                            value={place.opening_hours || ""}
                            onChange={(e) => update("opening_hours", e.target.value)}
                            className="form-input"
                            placeholder="09:00 - 21:00"
                        />
                    </Field>

                    <Field label="Rentang Harga">
                        <input
                            value={place.price_range || ""}
                            onChange={(e) => update("price_range", e.target.value)}
                            className="form-input"
                            placeholder="Rp10k - Rp30k"
                        />
                    </Field>

                    <div className="md:col-span-2">
                        <Field label="Photos (URL) — satu per baris">
                            <textarea
                                value={photosText}
                                onChange={(e) => {
                                    const arr = e.target.value
                                        .split("\n")
                                        .map((s) => s.trim())
                                        .filter(Boolean);
                                    update("photos", arr);
                                }}
                                className="form-input min-h-[120px] font-mono text-sm"
                                placeholder={"https://example.com/foto1.jpg\nhttps://example.com/foto2.jpg"}
                            />
                        </Field>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
             <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
                Reset / Batal
            </button>
            
            <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg shadow-md transition-all focus:ring-4 focus:ring-emerald-100 
                    ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700 hover:shadow-lg'}`}
            >
                {isSaving ? (
                     <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        Menyimpan...
                    </span>
                ) : "Simpan Perubahan"}
            </button>
        </div>
      </div>
    </div>
  );
}

// =========================
// UI HELPERS
// =========================

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      <style>{`
          .form-input {
              width: 100%;
              border-radius: 0.5rem;
              border: 1px solid #d1d5db;
              padding: 0.625rem 0.75rem;
              font-size: 0.875rem;
              transition: all 0.2s;
          }
          .form-input:focus {
              outline: none;
              border-color: #059669; /* emerald-600 */
              box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
          }
        `}</style>
    </div>
  );
}

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