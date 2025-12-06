import React, { useState, useEffect } from 'react';
import myPhoto from '../assets/ohim.jpeg';

// --- KOMPONEN LOGIN FORM (LENGKAP: 2FA, REMEMBER ME, RESET PASS) ---
export const LoginForm = ({ onLogin, onSwitchMode }) => {
  // State untuk Data Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // State untuk Logika Tampilan (View Logic)
  // step: 'credentials' | 'otp' | 'forgot-password'
  const [step, setStep] = useState('credentials'); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 1. Cek Remember Me saat komponen dimuat
  useEffect(() => {
    const savedEmail = localStorage.getItem('makanKi_savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // 2. Handle Login Awal (Email & Password)
  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulasi Validasi Server
    setTimeout(() => {
      if (password.length < 6) {
        setError('Kata sandi minimal 6 karakter.');
        setIsLoading(false);
        return;
      }

      // Jika sukses, pindah ke langkah 2FA
      setIsLoading(false);
      setStep('otp');
      setMessage(`Kode OTP telah dikirim ke ${email}`);
    }, 1000);
  };

  // 3. Handle Submit OTP (Langkah Terakhir)
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulasi Verifikasi OTP
    setTimeout(() => {
      // Hardcode OTP '123456' untuk demo
      if (otp !== '123456') {
        setError('Kode OTP salah. Coba gunakan 123456.');
        setIsLoading(false);
        return;
      }

      // --- LOGIKA REMEMBER ME ---
      if (rememberMe) {
        localStorage.setItem('makanKi_savedEmail', email);
      } else {
        localStorage.removeItem('makanKi_savedEmail');
      }

      // --- LOGIN SUKSES ---
      const mockUser = {
        name: 'Muchammad Abdurrohim',
        email: email,
        level: 'Legend',
        joinDate: 'Agustus 1945',
        reviewCount: 3,
        avatarUrl: myPhoto
      };
      
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  // 4. Handle Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();

    console.log("Foto Profil Path:", fotoProfilSaya);

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setMessage(`Link reset password telah dikirim ke ${email}. Silakan cek inbox Anda.`);
      // Jangan langsung pindah halaman agar user membaca pesan, 
      // tapi sediakan tombol kembali manual.
    }, 1500);
  };

  // --- RENDER: TAMPILAN LUPA PASSWORD ---
  if (step === 'forgot-password') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Reset Kata Sandi</h2>
            <p className="mt-2 text-sm text-gray-600">
              Masukkan email Anda untuk menerima link reset.
            </p>
          </div>

          {message ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm text-center">
              {message}
            </div>
          ) : null}

          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {!message && (
              <div>
                <label htmlFor="reset-email" className="sr-only">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="Alamat Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!message && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { setStep('credentials'); setMessage(''); setError(''); }}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Kembali ke Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: TAMPILAN UTAMA (LOGIN & 2FA) ---
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {step === 'otp' ? 'Verifikasi Dua Langkah' : 'Masuk ke Akun'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'otp' 
              ? 'Demi keamanan, masukkan kode OTP.' 
              : <>Atau <button onClick={onSwitchMode} className="font-medium text-rose-600 hover:text-rose-500">daftar akun baru</button></>
            }
          </p>
        </div>

        {/* Notifikasi Error / Pesan */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        {message && step === 'otp' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-2 rounded-md text-sm text-center">
            {message}
          </div>
        )}

        {/* FORM 2FA OTP */}
        {step === 'otp' ? (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-center mb-2">
                Masukkan Kode 6 Digit
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength="6"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-center text-2xl tracking-widest"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70 transition-colors"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                className="text-sm text-gray-500 hover:text-gray-900 text-center"
              >
                Kembali ke input email
              </button>
            </div>
          </form>
        ) : (
          /* FORM EMAIL & PASSWORD */
          <form className="mt-8 space-y-6" onSubmit={handleCredentialsSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="Alamat Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Kata Sandi</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => { setStep('forgot-password'); setError(''); setMessage(''); }} 
                  className="font-medium text-rose-600 hover:text-rose-500"
                >
                  Lupa kata sandi?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- KOMPONEN REGISTER FORM (STANDAR) ---
export const RegisterForm = ({ onLogin, onSwitchMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulasi API Call untuk Register
    setTimeout(() => {
      // Mock register success
      const mockUser = {
        name: name,
        email: email,
        level: 'Newbie', 
        joinDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        reviewCount: 0,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e11d48&color=fff`
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sudah punya akun? <button onClick={onSwitchMode} className="font-medium text-rose-600 hover:text-rose-500">Masuk di sini</button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Nama Lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Kata Sandi</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};