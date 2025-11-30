'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // --- FUNGSI SIGN UP (Tidak ada perubahan logika) ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendaftar.');
      }
      alert('Registrasi sukses! Silakan login.');
      setIsSigningUp(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  // --- FUNGSI SIGN IN (Logika REDIRECT diubah) ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal login.');
      }

      const { session } = data;
      await supabase.auth.setSession(session);

      // --- PERUBAHAN ---
      // Arahkan ke halaman utama ('/'), bukan '/dashboard'
      router.push('/');
      router.refresh(); // Refresh untuk memastikan header server component update
      // -----------------
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  // --- FUNGSI GOOGLE LOGIN (Tidak ada perubahan logika) ---
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  // --- Tampilan Form (Styling diubah) ---
  return (
    <form
      onSubmit={isSigningUp ? handleSignUp : handleSignIn}
      className="flex flex-col gap-4"
    >
      {isSigningUp && (
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-gray-300 p-3 text-black focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          required
        />
      )}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="rounded border border-gray-300 p-3 text-black focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border border-gray-300 p-3 text-black focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        required
      />

      {/* Tombol Aksi (Warna diubah) */}
      <button
        type="submit"
        className="rounded bg-orange-700 px-4 py-2 text-white hover:bg-orange-800"
      >
        {isSigningUp ? 'Buat Akun' : 'Login'}
      </button>

      {/* Tombol ganti mode (Warna diubah) */}
      <button
        type="button"
        onClick={() => setIsSigningUp(!isSigningUp)}
        className="text-sm text-black hover:underline"
      >
        {isSigningUp
          ? 'Sudah punya akun? Login di sini'
          : 'Belum punya akun? Daftar di sini'}
      </button>

      {/* --- Pemisah dan Login Google --- */}
      <div className="my-4 flex items-center">
        <hr className="flex grow border-t border-gray-300" />
        <span className="px-4 text-gray-500">OR</span>
        <hr className="flex grow border-t border-gray-300" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full rounded bg-white px-4 py-2 text-black shadow-md ring-1 ring-gray-200 hover:bg-gray-50"
      >
        Login with Google
      </button>
    </form>
  );
}