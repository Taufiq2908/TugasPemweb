import React, { useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const VerifyEmail = () => {
  const [status, setStatus] = useState('processing'); 
  const [message, setMessage] = useState('Memproses verifikasi...');
  
  // 1. Gunakan useRef untuk mencegah eksekusi ganda (React Strict Mode issue)
  const hasRun = useRef(false);

  useEffect(() => {
    // Jika sudah pernah jalan, hentikan.
    if (hasRun.current) return;
    hasRun.current = true;

    // 2. BERSIHKAN SESI LAMA (PENTING!)
    // Ini mencegah Anda login sebagai Admin dari sesi sebelumnya
    localStorage.removeItem("makanKi_token");
    
    const verify = async () => {
      // Ambil token dari URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token tidak ditemukan di URL.');
        return;
      }

      try {
        // Panggil Backend
        const res = await fetch(`${API_BASE}/auth/verify?token=${token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await res.json();

        if (res.ok) {
          // 3. Simpan Token Baru (User Biasa)
          localStorage.setItem("makanKi_token", data.token);
          localStorage.setItem("makanKi_askLocation", "true");
          setStatus('success');
          setMessage('Verifikasi Berhasil! Mengarahkan ke Beranda...');

          // 4. Hard Redirect ke Homepage (agar App.jsx membaca token baru)
          setTimeout(() => {
            window.location.href = "/"; 
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Gagal memverifikasi.');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage('Terjadi kesalahan koneksi.');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        
        {status === 'processing' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Memverifikasi Akun...</h2>
            <p className="text-gray-500 mt-2 text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Sukses!</h2>
            <p className="text-gray-600 font-medium">Anda sudah login otomatis.</p>
            <p className="text-sm text-gray-400 mt-4">Mohon tunggu...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Gagal</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button 
                onClick={() => window.location.href = "/login"} 
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-bold transition"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};