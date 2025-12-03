export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import DashboardLayout from './components/dashboard/DashBoardLayout';
import LandingPage from '@/components/landing/LandingPage';// Impor komponen baru

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // LOGIKA TAMPILAN:
  // 1. Jika user sudah login, langsung masuk ke Dashboard.
  if (user) {
    return <DashboardLayout user={user} />;
  }

  // 2. Jika user belum login, tampilkan Slide/Landing Page terlebih dahulu.
  // User akan menekan tombol "Masuk" atau "Daftar" di LandingPage untuk login.
  return <LandingPage />;
}