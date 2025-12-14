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

  if (!place) {
    return <div className="p-6 text-gray-500">Memuat data restoran...</div>;
  }

  const update = (key, value) =>
    setPlace((prev) => ({ ...prev, [key]: value }));

  const photosText = Array.isArray(place.photos)
    ? place.photos.join("\n")
    : "";

  // =========================
  // SAVE (PUT OWNER)
  // =========================
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

  // =========================
  // CANCEL → RESTORE DATA
  // =========================
  const handleCancel = () => {
    setPlace(original);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 max-w-2xl">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Kembali
      </button>

      <div className="mb-4">
        <h2 className="text-xl font-bold">Edit Restoran</h2>
        <p className="text-sm text-gray-500">
          Status saat ini:{" "}
          <b className="capitalize">{place.status}</b>
        </p>
      </div>

      <div className="bg-white border rounded p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Nama Restoran
            </label>
            <input
              value={place.name || ""}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Deskripsi
            </label>
            <textarea
              value={place.description || ""}
              onChange={(e) =>
                update("description", e.target.value)
              }
              className="w-full border rounded p-2 min-h-[90px]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Alamat
            </label>
            <input
              value={place.address || ""}
              onChange={(e) => update("address", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Kota
            </label>
            <select
              value={place.city_id ?? ""}
              onChange={(e) =>
                update("city_id", Number(e.target.value))
              }
              className="w-full border rounded p-2"
            >
              <option value="" disabled>
                -- Pilih Kota --
              </option>
              {cityList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Jam Operasional
            </label>
            <input
              value={place.opening_hours || ""}
              onChange={(e) =>
                update("opening_hours", e.target.value)
              }
              placeholder="09:00 - 21:00"
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Latitude
            </label>
            <input
              value={place.lat ?? ""}
              onChange={(e) => update("lat", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Longitude
            </label>
            <input
              value={place.lon ?? ""}
              onChange={(e) => update("lon", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Rentang Harga
            </label>
            <input
              value={place.price_range || ""}
              onChange={(e) =>
                update("price_range", e.target.value)
              }
              placeholder="Rp10k - Rp30k"
              className="w-full border rounded p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Photos (URL) — satu per baris
            </label>
            <textarea
              value={photosText}
              onChange={(e) => {
                const arr = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);
                update("photos", arr);
              }}
              className="w-full border rounded p-2 min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 disabled:opacity-60 text-white px-4 py-2 rounded"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

          <button
            onClick={handleCancel}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
