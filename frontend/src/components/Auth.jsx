import React, { useState, useEffect } from 'react';
import myPhoto from '../assets/ohim.jpg'; // Pastikan path ini sesuai
import { checkUserLocation } from "../helpers/checkUserLocation"; // Pastikan path ini sesuai

// ================================
// CONFIG API BASE URL
// ================================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ======================================================
//        LOGIN COMPONENT (WITH PASSWORD TOGGLE)
// ======================================================
export const LoginForm = ({ onLogin, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // State untuk toggle password
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Load saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem('makanKi_savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal login.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("makanKi_token", data.token);

      if (rememberMe) {
        localStorage.setItem('makanKi_savedEmail', email);
      } else {
        localStorage.removeItem('makanKi_savedEmail');
      }

      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatarUrl: data.user.avatarUrl || myPhoto,
        joinDate: data.user.created_at || "Belum diketahui",
        level: "User",
        reviewCount: 0
      };

      onLogin({
        ...userData,
        role: data.user.role
      });

      if (data.user.role !== "admin") {
        checkUserLocation(userData);
      }

    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border">

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Masuk ke Akun</h2>
          <p className="mt-2 text-sm">
            Atau{" "}
            <button className="text-rose-600" onClick={onSwitchMode}>
              daftar akun baru
            </button>
          </p>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleCredentialsSubmit}>
          <div className="space-y-[-1px]"> {/* Menggabungkan border input atas bawah */}
            <input
              type="email"
              required
              placeholder="Alamat Email"
              className="w-full px-3 py-3 border rounded-t-md focus:z-10 relative focus:ring-rose-500 focus:border-rose-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            {/* Wrapper Password Input */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"} // Dinamis type
                required
                placeholder="Kata Sandi"
                className="w-full px-3 py-3 border rounded-b-md focus:z-10 relative focus:ring-rose-500 focus:border-rose-500 pr-10" // pr-10 untuk space icon
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Tombol Mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 z-20"
              >
                {showPassword ? (
                  // Icon Mata Terbuka (Show)
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Icon Mata Dicoret (Hide)
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center text-sm">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-900">Ingat saya</span>
            </label>

            <button 
              type="button"
              className="text-rose-600 hover:text-rose-500 text-sm font-medium"
              onClick={() => setMessage('FITUR FORGOT AKAN DIBUAT DI HALAMAN TERPISAH')}
            >
              Lupa kata sandi?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ======================================================
//        REGISTER FORM (WITH PASSWORD TOGGLE)
// ======================================================
export const RegisterForm = ({ onLogin, onSwitchMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk toggle password register
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mendaftar.");
        setIsLoading(false);
        return;
      }

      setStep("verify");
      setMessage("Kami telah mengirim email verifikasi ke inbox Anda.");

    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    }

    setIsLoading(false);
  };

  const resendVerification = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Tidak dapat mengirim ulang email verifikasi.");
        setIsLoading(false);
        return;
      }

      setMessage("Email verifikasi telah dikirim ulang!");

    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    }

    setIsLoading(false);
  };

  // STEP VERIFIKASI (TIDAK BERUBAH)
  if (step === "verify") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border text-center">
          <h2 className="text-2xl font-bold mb-2">Verifikasi Email Diperlukan</h2>
          <p className="text-gray-600 mb-4">
            Kami telah mengirim link verifikasi ke:
            <br /><strong>{email}</strong>
            <br />Silakan cek inbox atau folder spam Anda.
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <button 
            onClick={resendVerification}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-md font-medium mb-3"
          >
            Kirim Ulang Email Verifikasi
          </button>

          <button 
            onClick={() => onSwitchMode("login")}
            className="w-full py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Saya sudah verifikasi — Lanjut Login
          </button>
        </div>
      </div>
    );
  }

  // FORM REGISTER
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border">

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
          <p className="mt-2 text-sm">
            Sudah punya akun?{" "}
            <button className="text-rose-600 font-medium hover:text-rose-500" onClick={onSwitchMode}>
              Masuk di sini
            </button>
          </p>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 border px-4 py-2 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {!message && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input
              type="text"
              required
              placeholder="Nama Lengkap"
              className="w-full px-3 py-3 border rounded-md focus:ring-rose-500 focus:border-rose-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              required
              placeholder="Alamat Email"
              className="w-full px-3 py-3 border rounded-md focus:ring-rose-500 focus:border-rose-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Wrapper Password Input Register */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Dinamis
                required
                placeholder="Kata Sandi"
                className="w-full px-3 py-3 border rounded-md focus:ring-rose-500 focus:border-rose-500 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Tombol Mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  // Icon Mata Terbuka
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Icon Mata Dicoret
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};