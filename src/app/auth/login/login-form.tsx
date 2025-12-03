// src/app/auth/login/login-form.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Untuk Register
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  // --- FUNGSI SIGN UP ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Password dan Ulangi Password tidak sama!');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar.');
      alert('Registrasi sukses! Silakan login.');
      setIsSigningUp(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // --- FUNGSI SIGN IN ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal login.');

      const { session } = data;
      await supabase.auth.setSession(session);
      router.push('/');
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <form onSubmit={isSigningUp ? handleSignUp : handleSignIn} className="flex flex-col gap-5">
      
      {/* === MODE DAFTAR (REGISTER) === */}
      {isSigningUp ? (
        <>
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">
              Username<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-400 p-2 text-black focus:border-black focus:outline-none"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-400 p-2 text-black focus:border-black focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-400 p-2 pr-10 text-black focus:border-black focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Ulangi Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">
              Ulangi Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-gray-400 p-2 pr-10 text-black focus:border-black focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* === MODE MASUK (LOGIN) === */
        <>
          {/* Username / Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">
              Username / Email<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Username / Email"
              value={username} // Login handler uses 'username' var for login identifier
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-400 p-2 text-black focus:border-black focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-400 p-2 pr-10 text-black focus:border-black focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tombol Aksi (Outline Style) */}
      <div className="mt-4 flex justify-center">
        <button
          type="submit"
          className="w-32 rounded border border-gray-400 bg-white py-2 text-sm font-bold text-black shadow-sm hover:bg-gray-50 transition"
        >
          {isSigningUp ? 'Sign In' : 'Log In'}
        </button>
      </div>

      {/* Login Sosial */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500">
          {isSigningUp ? 'Atau daftar dengan' : 'Atau masuk dengan'}
        </span>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="rounded-full p-2 hover:bg-gray-100 transition"
        >
          {/* Ikon Google SVG */}
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </button>
      </div>

      {/* Toggle Link */}
      <div className="text-center text-xs text-gray-500">
        {isSigningUp ? (
          <>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => setIsSigningUp(false)}
              className="font-bold text-blue-500 hover:underline"
            >
              LogIn
            </button>
          </>
        ) : (
          <>
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => setIsSigningUp(true)}
              className="font-bold text-blue-500 hover:underline"
            >
              SignUp
            </button>
          </>
        )}
      </div>
    </form>
  );
}