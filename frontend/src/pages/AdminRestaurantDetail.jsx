import React, { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "../services/api";

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

  if (loading) {
    return <div className="p-6 text-gray-500">Memuat data restoran...</div>;
  }

  if (!place) {
    return (
      <div className="p-6 text-red-600">
        Gagal memuat data restoran.
        <button onClick={onBack} className="block mt-4 text-sm text-rose-600">
          ← Kembali
        </button>
      </div>
    );
  }

  // =========================
  // ACTIONS
  // =========================
  const activate = async () => {
    await apiPut(`/admin/places/${restaurantId}/approve`, {}, token);
    onBack();
  };

  const reject = async () => {
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
      photos: Array.isArray(place.photos) ? place.photos : []
    };

    await apiPut(`/admin/places/${restaurantId}`, body, token);
    alert("Perubahan berhasil disimpan");
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={onBack} className="mb-6 text-sm text-rose-600">
        ← Kembali ke Admin
      </button>

      <h2 className="text-2xl font-bold mb-6">Detail Restoran (Admin)</h2>

      <div className="space-y-4">
        <Field label="Nama Restoran">
          <input
            value={place.name || ""}
            onChange={(e) => setPlace({ ...place, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </Field>

        <Field label="Alamat">
          <input
            value={place.address || ""}
            onChange={(e) => setPlace({ ...place, address: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude">
            <input
              type="number"
              value={place.lat ?? ""}
              onChange={(e) => setPlace({ ...place, lat: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </Field>

          <Field label="Longitude">
            <input
              type="number"
              value={place.lon ?? ""}
              onChange={(e) => setPlace({ ...place, lon: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </Field>
        </div>

        <Field label="Jam Operasional">
          <input
            value={place.opening_hours || ""}
            onChange={(e) =>
              setPlace({ ...place, opening_hours: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </Field>

        <Field label="Rentang Harga">
          <input
            value={place.price_range || ""}
            onChange={(e) =>
              setPlace({ ...place, price_range: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </Field>

        <Field label="Deskripsi">
          <textarea
            value={place.description || ""}
            onChange={(e) =>
              setPlace({ ...place, description: e.target.value })
            }
            className="w-full border rounded p-3 min-h-[120px]"
          />
        </Field>

        <div className="text-sm text-gray-600">
          <b>Status:</b>{" "}
          <span className="font-semibold capitalize">{place.status}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={save}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Simpan
        </button>

        {place.status !== "active" && (
          <button
            onClick={activate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Aktifkan
          </button>
        )}

        {place.status !== "rejected" && (
          <button
            onClick={reject}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Tolak
          </button>
        )}
      </div>
    </div>
  );
}

// =========================
// FIELD HELPER
// =========================
function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1">{label}</label>
      {children}
    </div>
  );
}
