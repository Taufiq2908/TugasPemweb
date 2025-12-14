export default function AdminTabs({ activeTab, setActiveTab }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => setActiveTab("all")}>Semua</button>
      <button onClick={() => setActiveTab("pending")}>Perlu Verifikasi</button>
      <button onClick={() => setActiveTab("rejected")}>Ditolak</button>
      <button onClick={() => setActiveTab("add")}>+ Tambah</button>
    </div>
  );
}
