import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from './sign-out-button';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Seharusnya ini sudah ditangani middleware, tapi sebagai fallback
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Selamat Datang, {user.email}
      </h1>
      <p>Ini adalah halaman rahasia yang terproteksi.</p>
      <pre className="mt-4 rounded bg-gray-200 p-4 text-sm text-black">
        {JSON.stringify(user, null, 2)}
      </pre>
      <SignOutButton />
    </div>
  );
}