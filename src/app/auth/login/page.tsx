// src/app/auth/login/page.tsx
export const dynamic = 'force-dynamic';

import LoginForm from './login-form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika user sudah login, tendang ke halaman utama ('/')
  if (user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* --- HEADER KHUSUS AUTH --- */}
      <header className="flex h-20 items-center border-b border-gray-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logo_geovalid.png"
            alt="GeoValid Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-black tracking-wide uppercase text-black">
            GEOVALID
          </span>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo Tengah */}
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo_geovalid.png"
              alt="GeoValid Logo Center"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
            <h1 className="mt-2 text-xl font-bold text-[#5c4033]">GeoValid</h1>
          </div>

          {/* Form Login/Register */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}