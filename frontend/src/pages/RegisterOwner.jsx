import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RegisterOwner({ user, token, onSuccess, onBack }) {
  const [form, setForm] = useState({
    nik: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setError("");

    if (!form.nik || !form.phone || !form.address) {
      setError("Semua field wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/register-owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mendaftar sebagai owner.");
        setLoading(false);
        return;
      }

      // 🔥 UPDATE USER ROLE DI APP STATE
      onSuccess({
        ...user,
        role: "owner"
      });

    } catch (err) {
      setError("Gagal terhubung ke server.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-rose-600"
      >
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold mb-2">
        Daftar sebagai Pemilik Restoran
      </h1>
      <p className="text-gray-600 mb-6">
        Lengkapi data berikut untuk mendaftar sebagai pemilik restoran.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <input
          placeholder="NIK"
          value={form.nik}
          onChange={(e) => update("nik", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Nomor HP"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          placeholder="Alamat Lengkap"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full border rounded px-3 py-2 min-h-[100px]"
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-6 py-2 rounded"
        >
          {loading ? "Mengirim..." : "Daftar Sekarang"}
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
