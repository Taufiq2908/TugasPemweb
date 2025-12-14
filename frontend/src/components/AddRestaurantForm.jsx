import api from "../services/api";
import { useState } from "react";

export default function AddRestaurantForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city_id: 1,
    lat: "",
    lon: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/admin/places", form);
    alert("Restoran ditambahkan");
    onSuccess();
  };

  return (
    <form onSubmit={submit}>
      <h2>Tambah Restoran</h2>

      <input placeholder="Nama" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Alamat" onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <textarea placeholder="Deskripsi" onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <button type="submit">Simpan</button>
    </form>
  );
}
