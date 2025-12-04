export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/app/components/dashboard/DashBoardLayout';
import SettingsView from './SettingsView';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');   

  return (
    <DashboardLayout user={user} showChatbot={false} showSidebar={false}>
      {/* Panggil Client Component SettingsView */}
      <SettingsView initialUser={user} />
    </DashboardLayout>
  );
}