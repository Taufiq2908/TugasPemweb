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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={onBack} className="mb-6 text-sm text-rose-600">
        ← Kembali ke Admin
      </button>

      <h1 className="text-2xl font-bold mb-6">Tambah Restoran Baru</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <input
          placeholder="Nama Restoran"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          placeholder="Deskripsi"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border rounded px-3 py-2 min-h-[100px]"
        />

        <input
          placeholder="Alamat"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="City ID (contoh: 1)"
          value={form.city_id}
          onChange={(e) => update("city_id", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Latitude"
            value={form.lat}
            onChange={(e) => update("lat", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="Longitude"
            value={form.lon}
            onChange={(e) => update("lon", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <input
          placeholder="Jam Operasional (contoh: 08.00 - 22.00)"
          value={form.opening_hours}
          onChange={(e) => update("opening_hours", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Rentang Harga (contoh: Rp20k - Rp50k)"
          value={form.price_range}
          onChange={(e) => update("price_range", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>

        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
