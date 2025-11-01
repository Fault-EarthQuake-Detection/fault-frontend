'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login'); // Arahkan kembali ke login
  };

  return (
    <button
      onClick={handleSignOut}
      className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
    >
      Sign Out
    </button>
  );
}