import React, { useState } from "react";
import { apiPost } from "../services/api";

export default function AdminAddRestaurant({ token, onBack }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city_id: "",
    lat: "",
    lon: "",
    opening_hours: "",
    price_range: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setError("");

    // 🔹 VALIDASI SESUAI BACKEND
    if (!form.name || !form.address) {
      setError("Nama restoran dan alamat wajib diisi");
      return;
    }

    setLoading(true);

    try {
      await apiPost(
        "/admin/places",
        {
          name: form.name,
          description: form.description || null,
          address: form.address,
          city_id: form.city_id ? Number(form.city_id) : null,
          lat: form.lat ? Number(form.lat) : null,
          lon: form.lon ? Number(form.lon) : null,
          opening_hours: form.opening_hours || null,
          price_range: form.price_range || null,
          photos: [] // 🔥 PENTING
        },
        token
      );

      alert("Restoran berhasil ditambahkan");
      onBack();
    } catch (err) {
      console.error(err);
      setError("Gagal menambahkan restoran");
    }

    setLoading(false);
  };

  // =========================
  // UI UPDATE
  // =========================
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
            onClick={onBack} 
            className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
            <span className="transform group-hover:-translate-x-1 transition-transform mr-1">←</span>
            Kembali ke Admin
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tambah Restoran Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Isi formulir di bawah untuk mendaftarkan mitra baru.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        
        {/* Error Alert */}
        {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center text-red-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <span className="text-sm font-medium">{error}</span>
            </div>
        )}

        <div className="p-6 sm:p-8 space-y-8">
            
            {/* Group 1: Identitas */}
            <div className="space-y-6">
                <Field label="Nama Restoran" required>
                    <input
                        type="text"
                        placeholder="Contoh: Warung Makan Bahari"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="form-input"
                    />
                </Field>

                <Field label="Deskripsi Singkat">
                    <textarea
                        placeholder="Jelaskan spesialisasi makanan atau suasana tempat..."
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        className="form-input min-h-[100px] resize-none"
                    />
                </Field>
            </div>

            <hr className="border-gray-100" />

            {/* Group 2: Lokasi */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Lokasi & Alamat</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="md:col-span-2">
                        <Field label="Alamat Lengkap" required>
                            <input
                                type="text"
                                placeholder="Jalan, Nomor, Kelurahan..."
                                value={form.address}
                                onChange={(e) => update("address", e.target.value)}
                                className="form-input"
                            />
                        </Field>
                    </div>
                    <div>
                        <Field label="City ID">
                            <input
                                type="number"
                                placeholder="ID Kota (Angka)"
                                value={form.city_id}
                                onChange={(e) => update("city_id", e.target.value)}
                                className="form-input"
                            />
                        </Field>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <Field label="Latitude">
                        <input
                            type="number"
                            placeholder="-5.xxxx"
                            value={form.lat}
                            onChange={(e) => update("lat", e.target.value)}
                            className="form-input bg-white"
                        />
                    </Field>
                    <Field label="Longitude">
                        <input
                            type="number"
                            placeholder="119.xxxx"
                            value={form.lon}
                            onChange={(e) => update("lon", e.target.value)}
                            className="form-input bg-white"
                        />
                    </Field>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Group 3: Detail Lainnya */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Informasi Operasional</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Jam Operasional">
                        <input
                            type="text"
                            placeholder="08.00 - 22.00"
                            value={form.opening_hours}
                            onChange={(e) => update("opening_hours", e.target.value)}
                            className="form-input"
                        />
                    </Field>

                    <Field label="Rentang Harga">
                        <input
                            type="text"
                            placeholder="Rp20k - Rp50k"
                            value={form.price_range}
                            onChange={(e) => update("price_range", e.target.value)}
                            className="form-input"
                        />
                    </Field>
                </div>
            </div>
        </div>

        {/* Action Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
                onClick={onBack}
                disabled={loading}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
            >
                Batal
            </button>

            <button
                onClick={submit}
                disabled={loading}
                className={`px-6 py-2.5 text-white font-medium rounded-lg shadow-md transition-all focus:ring-4 focus:ring-rose-100
                    ${loading 
                        ? "bg-rose-400 cursor-not-allowed" 
                        : "bg-rose-600 hover:bg-rose-700 hover:shadow-lg"
                    }`}
            >
                {loading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Menyimpan...
                    </span>
                ) : (
                    "Simpan Data"
                )}
            </button>
        </div>
      </div>
    </div>
  );
}

// =========================
// COMPONENT: FIELD HELPER
// =========================
function Field({ label, required, children }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
        
        {/* Styling inject untuk class "form-input" */}
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
              border-color: #e11d48;
              box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1);
          }
        `}</style>
      </div>
    );
  }