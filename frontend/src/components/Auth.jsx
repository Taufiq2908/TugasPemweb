import React, { useState, useEffect } from 'react';
import myPhoto from '../assets/ohim.jpeg';
import { checkUserLocation } from "../helpers/checkUserLocation";

// ================================
// CONFIG API BASE URL
// ================================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ======================================================
//        LOGIN COMPONENT (REAL API + VERIFY HANDLING)
// ======================================================
export const LoginForm = ({ onLogin, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [step] = useState('credentials'); 
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

  // ==========================
  // LOGIN SUBMIT
  // ==========================
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

      // Save token
      localStorage.setItem("makanKi_token", data.token);

      // Remember email
      if (rememberMe) {
        localStorage.setItem('makanKi_savedEmail', email);
      } else {
        localStorage.removeItem('makanKi_savedEmail');
      }

      // Format user
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
        role: data.user.role   // ⬅️ PENTING
      });

      if (data.user.role !== "admin") {
        checkUserLocation(userData);
      }
 

    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    }

    setIsLoading(false);
  };

  // ==========================
  // FORGOT PASSWORD
  // ==========================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mengirim reset password.");
        setIsLoading(false);
        return;
      }

      setMessage("Link reset password sudah dikirim ke email Anda.");

    } catch (err) {
      setError("Kesalahan koneksi ke server.");
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
          <div>
            <input
              type="email"
              required
              placeholder="Alamat Email"
              className="w-full px-3 py-3 border rounded-t-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              placeholder="Kata Sandi"
              className="w-full px-3 py-3 border rounded-b-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center text-sm">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ml-2">Ingat saya</span>
            </label>

            <button 
              type="button"
              className="text-rose-600 text-sm"
              onClick={() => setMessage('FITUR FORGOT AKAN DIBUAT DI HALAMAN TERPISAH')}
            >
              Lupa kata sandi?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};



// ======================================================
//       REGISTER + VERIFICATION SCREEN (NO OTP)
// ======================================================
export const RegisterForm = ({ onLogin, onSwitchMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [step, setStep] = useState("form"); // "form" | "verify"
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ==========================
  // REGISTER SUBMIT
  // ==========================
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


  // ==========================
  // RESEND VERIFICATION (pakai register ulang)
  // ==========================
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

  // ==========================
  // VERIFICATION SCREEN (Pengganti OTP)
  // ==========================
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

          {/* Resend email */}
          <button 
            onClick={resendVerification}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-md font-medium mb-3"
          >
            Kirim Ulang Email Verifikasi
          </button>

          {/* User sudah klik link di email */}
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


  // ==========================
  // REGISTER FORM DEFAULT
  // ==========================
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border">

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
          <p className="mt-2 text-sm">
            Sudah punya akun?{" "}
            <button className="text-rose-600" onClick={onSwitchMode}>
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
              className="w-full px-3 py-3 border rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              required
              placeholder="Alamat Email"
              className="w-full px-3 py-3 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              required
              placeholder="Kata Sandi"
              className="w-full px-3 py-3 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700"
            >
              {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
