// 'use client';

// import { useState } from 'react';
// import { createClient } from '@/utils/supabase/client'; // Import client untuk BROWSER
// import { useRouter } from 'next/navigation';

// export default function LoginForm() {
//   const [email, setEmail] = useState('');
//   const [username, setUsername] = useState(''); // State baru untuk username
//   const [password, setPassword] = useState('');
//   const [isSigningUp, setIsSigningUp] = useState(false); // State untuk ganti mode
//   const router = useRouter();

//   // Kita tetap butuh client Supabase di frontend untuk 2 hal:
//   // 1. Login Google
//   // 2. setSession() setelah login password berhasil
//   const supabase = createClient();

//   // --- FUNGSI BARU: Handle Sign Up (via Express) ---
//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await fetch('http://localhost:3000/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, username, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Gagal mendaftar.');
//       }

//       alert('Registrasi sukses! Silakan login.');
//       setIsSigningUp(false); // Balik ke mode login

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       alert(`Error: ${error.message}`);
//       console.error(error);
//     }
//   };

//   // --- FUNGSI BARU: Handle Sign In (via Express) ---
//   const handleSignIn = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await fetch('http://localhost:3000/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }), // Login pakai username
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Gagal login.');
//       }

//       // INI BAGIAN PENTINGNYA:
//       // Kita dapat session (access_token & refresh_token) dari Express...
//       // ...lalu kita "kasih tahu" client Supabase di frontend.
//       const { session } = data;
//       await supabase.auth.setSession(session);

//       // Client Supabase sekarang otomatis nyimpen cookie
//       router.push('/dashboard'); // Arahkan ke dashboard

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any)
//     {
//       alert(`Error: ${error.message}`);
//       console.error(error);
//     }
//   };

//   // --- FUNGSI INI TETAP SAMA (via Supabase Langsung) ---
//   const handleGoogleLogin = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `${location.origin}/auth/callback`,
//       },
//     });
//   };

//   // --- Tampilan Form (dengan toggle Sign Up/Login) ---
//   return (
//     <form 
//       onSubmit={isSigningUp ? handleSignUp : handleSignIn} 
//       className="flex flex-col gap-4"
//     >
//       {/* Field Email (hanya muncul saat Sign Up) */}
//       {isSigningUp && (
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="rounded border p-3 text-black"
//           required
//         />
//       )}

//       {/* Field Username (muncul di kedua mode) */}
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         className="rounded border p-3 text-black"
//         required
//       />

//       {/* Field Password (muncul di kedua mode) */}
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="rounded border p-3 text-black"
//         required
//       />

//       {/* Tombol Aksi (Login atau Sign Up) */}
//       <button
//         type="submit"
//         className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
//       >
//         {isSigningUp ? 'Buat Akun' : 'Login'}
//       </button>

//       {/* Tombol ganti mode */}
//       <button
//         type="button"
//         onClick={() => setIsSigningUp(!isSigningUp)}
//         className="text-sm text-gray-600 hover:underline"
//       >
//         {isSigningUp
//           ? 'Sudah punya akun? Login di sini'
//           : 'Belum punya akun? Daftar di sini'}
//       </button>

//       {/* --- Pemisah dan Login Google --- */}
//       <div className="my-4 flex items-center">
//         <hr className="flex-grow border-t border-gray-300" />
//         <span className="px-4 text-gray-500">OR</span>
//         <hr className="flex-grow border-t border-gray-300" />
//       </div>

//       <button
//         type="button"
//         onClick={handleGoogleLogin}
//         className="w-full rounded bg-white px-4 py-2 text-black shadow-md ring-1 ring-gray-200 hover:bg-gray-50"
//       >
//         Login with Google
//       </button>
//     </form>
//   );
// }

'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

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
      router.push('/dashboard');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <form
      onSubmit={isSigningUp ? handleSignUp : handleSignIn}
      className="flex flex-col gap-4"
    >

      {/* Judul Login / Register */}
      <h2 className="text-center text-3xl font-bold text-[#71683C]">
        {isSigningUp ? 'REGISTER' : 'LOGIN'}
      </h2>

      {/* Field Email (hanya untuk Sign Up) */}
      {isSigningUp && (
        <div>
          <label className="block text-sm font-medium text-[#71683C]">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-[#B7A07C] bg-white p-3 text-[#71683C] placeholder-gray-400 focus:border-[#C67C3E] focus:outline-none"
            required
          />
        </div>
      )}

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-[#71683C]">
          Username<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded border border-[#71683C] bg-white p-3 text-[#71683C] placeholder-gray-400 focus:border-[#C67C3E] focus:outline-none"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-[#71683C]">
          Password<span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-[#71683C] bg-white p-3 text-[#71683C] placeholder-gray-400 focus:border-[#71683C] focus:outline-none"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-[#6E5A2E]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Tombol Login / Register */}
      <button
        type="submit"
        className="mt-4 w-full rounded-full bg-[#D46E46] py-3 font-semibold text-white shadow hover:bg-[#b86e2e]"
      >
        {isSigningUp ? 'Daftar' : 'Masuk'}
      </button>

      {/* Login Google */}
      <div className="mt-4 text-center text-sm text-[#71683C]">
        <p>Atau masuk dengan</p>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-2 flex w-full items-center justify-center gap-3 rounded py-2 text-gray-700 "
        >
          <Image
            src="/google.png"
            alt="Google Logo"
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Link daftar / login */}
      <p className="mb-5 text-center text-sm text-[#71683C]">
        {isSigningUp ? 'Sudah punya akun? ' : 'Belum punya akun? '}
        <span
          onClick={() => setIsSigningUp(!isSigningUp)}
          className="cursor-pointer font-semibold hover:underline"
        >
          {isSigningUp ? 'Masuk disini' : 'Daftar disini'}
        </span>
      </p>
    </form>
  );
}
