import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../services/api";
import OwnerRestaurantCard from "../components/OwnerRestaurantCard";
import { CITY_MAP } from "../constant/cities";

export default function OwnerPage({ user, token, onOpenDetail }) {
  const [places, setPlaces] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cityList = useMemo(() => Object.values(CITY_MAP || {}), []);

  // =========================
  // LOAD OWNER PLACES
  // =========================
  const loadPlaces = async () => {
    if (!token) return;

    const res = await apiGet("/owner/places", token);

    if (res?.error) {
      alert(res.error);
      return;
    }

    setPlaces(Array.isArray(res?.places) ? res.places : []);
  };

  useEffect(() => {
    loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // =========================
  // SUBMIT NEW RESTO
  // =========================
  const submitNew = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Token tidak ada. Silakan login ulang.");
      return;
    }

    const form = e.target;

    const photosRaw = form.photos.value || "";
    const photos = photosRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      address: form.address.value.trim(),
      city_id: Number(form.city_id.value),
      lat: Number(form.lat.value),
      lon: Number(form.lon.value),
      opening_hours: form.opening_hours.value.trim(),
      price_range: form.price_range.value.trim(),
      photos
    };

    if (!body.name || !body.address || !body.city_id) {
      alert("Nama, alamat, dan kota wajib diisi.");
      return;
    }

    if (Number.isNaN(body.lat) || Number.isNaN(body.lon)) {
      alert("Latitude dan Longitude harus berupa angka.");
      return;
    }

    setIsLoading(true);
    const res = await apiPost("/owner/places", body, token);
    setIsLoading(false);

    if (res?.error) {
      alert(res.error);
      return;
    }

    alert("Restoran berhasil ditambahkan dan menunggu verifikasi admin.");
    setShowAddForm(false);
    await loadPlaces();
  };

  // =========================
  // UI UPDATE
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel Mitra Restoran</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data restoran Anda. Perubahan data akan merubah status menjadi <span className="font-semibold text-amber-600">Pending</span>.
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Restoran
          </button>
        )}
      </div>

      {/* ADD FORM CARD */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10 animate-fade-in-down">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Formulir Restoran Baru</h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <form onSubmit={submitNew} className="p-6 sm:p-8">
                <div className="space-y-6">
                    {/* Identity Group */}
                    <div className="grid grid-cols-1 gap-6">
                        <Field label="Nama Restoran" required>
                            <input name="name" className="form-input" placeholder="Contoh: Kedai Kopi Senja" />
                        </Field>
                        
                        <Field label="Deskripsi">
                            <textarea name="description" className="form-input min-h-[80px]" placeholder="Deskripsi singkat restoran..." />
                        </Field>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Location Group */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Lokasi</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Field label="Alamat Lengkap" required>
                                    <input name="address" className="form-input" placeholder="Jalan, No, Kelurahan..." />
                                </Field>
                            </div>

                            <Field label="Kota" required>
                                <select name="city_id" className="form-input" defaultValue="">
                                    <option value="" disabled>-- Pilih Kota --</option>
                                    {cityList.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Latitude" required>
                                    <input name="lat" defaultValue={-5.147} className="form-input font-mono text-sm" />
                                </Field>
                                <Field label="Longitude" required>
                                    <input name="lon" defaultValue={119.432} className="form-input font-mono text-sm" />
                                </Field>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Details Group */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detail Operasional</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Jam Operasional">
                                <input name="opening_hours" className="form-input" placeholder="09:00 - 22:00" />
                            </Field>
                            <Field label="Rentang Harga">
                                <input name="price_range" className="form-input" placeholder="Rp 15k - Rp 50k" />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Foto URL (Satu per baris)">
                                    <textarea name="photos" className="form-input min-h-[100px] font-mono text-sm" placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"} />
                                </Field>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-emerald-100 
                            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700 hover:shadow'}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                Menyimpan...
                            </span>
                        ) : "Simpan Restoran"}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* LIST RESTO SECTION */}
      {places.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada restoran</h3>
            <p className="text-gray-500 max-w-sm">Anda belum mendaftarkan restoran apapun. Klik tombol <span className="font-semibold">Tambah Restoran</span> di atas untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <OwnerRestaurantCard
              key={place.id}
              place={place}
              onClick={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =========================
// UI HELPERS
// =========================
function Field({ label, required, children }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
        <style>{`
          .form-input {
              width: 100%;
              border-radius: 0.5rem;
              border: 1px solid #d1d5db;
              padding: 0.625rem 0.75rem;
              font-size: 0.875rem;
              transition: all 0.2s;
              background-color: #fff;
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