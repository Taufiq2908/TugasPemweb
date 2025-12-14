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
  // UI
  // =========================
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Panel Pemilik Restoran</h1>
          <p className="text-sm text-gray-500">
            Kelola restoran milikmu. Setiap perubahan akan membuat status kembali{" "}
            <b>pending</b>.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="bg-emerald-600 text-white px-4 py-2 rounded"
        >
          + Tambah Restoran
        </button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <form
          onSubmit={submitNew}
          className="mb-8 bg-white p-4 rounded border max-w-2xl"
        >
          <h3 className="font-bold mb-4">Tambah Restoran Baru</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Nama Restoran
              </label>
              <input
                name="name"
                required
                className="block w-full border p-2 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                className="block w-full border p-2 rounded min-h-[90px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Alamat
              </label>
              <input
                name="address"
                required
                className="block w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Kota
              </label>
              <select
                name="city_id"
                required
                className="block w-full border p-2 rounded"
                defaultValue=""
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
                name="opening_hours"
                placeholder="09:00 - 21:00"
                className="block w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Latitude
              </label>
              <input
                name="lat"
                required
                defaultValue={-5.147}
                className="block w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Longitude
              </label>
              <input
                name="lon"
                required
                defaultValue={119.432}
                className="block w-full border p-2 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Rentang Harga
              </label>
              <input
                name="price_range"
                placeholder="Rp10k - Rp30k"
                className="block w-full border p-2 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Photos (URL) — satu per baris
              </label>
              <textarea
                name="photos"
                placeholder={"https://...\nhttps://..."}
                className="block w-full border p-2 rounded min-h-[90px]"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 disabled:opacity-60 text-white px-4 py-2 rounded"
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* LIST RESTO */}
      {places.length === 0 ? (
        <div className="bg-white border rounded p-6 text-gray-600">
          Belum ada restoran. Klik <b>Tambah Restoran</b> untuk mulai.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
