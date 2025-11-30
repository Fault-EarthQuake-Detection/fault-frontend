'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Terima `className` sebagai prop
type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Arahkan kembali ke halaman utama (/)
    router.refresh(); // Refresh halaman untuk memastikan state ter-reset
  };

  // Gunakan className prop, atau fallback ke style lama jika tidak ada
  const buttonClassName = className
    ? className
    : 'mt-4 rounded bg-red-500 px-4 py-2 text-white'; // Fallback style

  return (
    <button onClick={handleSignOut} className={buttonClassName}>
      Sign Out
    </button>
  );
}