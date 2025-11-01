// TAMBAHKAN INI DI ATAS
export const dynamic = 'force-dynamic';

import LoginForm from './login-form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = await createClient();
  
  // Ini sekarang akan berhasil karena 'cookies()' tersedia
  const { data: { user } } = await supabase.auth.getUser();

  // Jika user sudah login, tendang ke dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-black">
          GeoValid Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}