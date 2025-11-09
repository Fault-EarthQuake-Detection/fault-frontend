// // TAMBAHKAN INI DI ATAS
// export const dynamic = 'force-dynamic';

// import LoginForm from './login-form';
// import { createClient } from '@/utils/supabase/server';
// import { redirect } from 'next/navigation';

// export default async function LoginPage() {
//   const supabase = await createClient();
  
//   // Ini sekarang akan berhasil karena 'cookies()' tersedia
//   const { data: { user } } = await supabase.auth.getUser();

//   // Jika user sudah login, tendang ke dashboard
//   if (user) {
//     redirect('/dashboard');
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
//         <h1 className="mb-6 text-center text-3xl font-bold text-black">
//           GeoValid Login
//         </h1>
//         <LoginForm />
//       </div>
//     </div>
//   );
// }

// TAMBAHKAN INI DI ATAS
export const dynamic = 'force-dynamic';

import LoginForm from './login-form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      {/* BAGIAN KIRI - Logo dan Deskripsi */}
      <div className="flex w-1/2 flex-col items-center justify-center bg-white px-12 text-center">
        <Image
          src="/logogeovalid.png" 
          alt="GeoValid Logo"
          width={270}
          height={270}
        />
        <h1 className="mt-4 text-3xl font-bold text-[#492B12]">GeoValid</h1>
        <p className="mt-2 text-base text-[#492B12]/80">
          Aplikasi Edukasi Geologi <br />
          Interaktif & Validasi Jalur Sesar
        </p>
      </div>

      {/* BAGIAN KANAN - Form Login */}
      <div className="flex w-1/2 flex-col items-center justify-center bg-[#fffaf2] px-16">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
