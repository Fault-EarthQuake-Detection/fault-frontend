// TAMBAHKAN INI DI ATAS
export const dynamic = 'force-dynamic';

import LoginForm from './login-form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { MapPin } from 'lucide-react'; // Impor ikon logo

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- PERUBAHAN ---
  // Jika user sudah login, tendang ke halaman utama ('/')
  if (user) {
    redirect('/');
  }
  // -----------------

  return (
    // Latar belakang disamakan dengan dashboard
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {/* Tambahkan Logo di atas judul */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-orange-100 p-3">
            <MapPin className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <h1 className="mb-6 text-center text-3xl font-bold text-black">
          GeoValid Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}