export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import DashboardLayout from './components/dashboard/DashBoardLayout';
 // Impor layout baru

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Serahkan semua logika tampilan ke DashboardLayout
  return <DashboardLayout user={user} />;
}