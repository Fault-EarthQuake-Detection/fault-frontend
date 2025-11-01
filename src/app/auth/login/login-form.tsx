'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Import client untuk BROWSER
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.signUp({
      email,
      password,
    });
    alert('Registrasi sukses! Silakan login.');
    router.refresh(); // Refresh halaman
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert('Error: Gagal login');
      console.error(error);
    } else {
      router.push('/dashboard'); // Arahkan ke dashboard
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <form className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border p-3 text-black"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border p-3 text-black"
        required
      />
      <div className="flex gap-4">
        <button
          onClick={handleSignIn}
          className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Login
        </button>
        <button
          onClick={handleSignUp}
          className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Sign Up
        </button>
      </div>

      <div className="my-4 flex items-center">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="px-4 text-gray-500">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <button
        type="button" // Pastikan type="button" agar tidak submit form
        onClick={handleGoogleLogin}
        className="w-full rounded bg-white px-4 py-2 text-black shadow-md ring-1 ring-gray-200 hover:bg-gray-50"
      >
        Login with Google
      </button>
    </form>
  );
}