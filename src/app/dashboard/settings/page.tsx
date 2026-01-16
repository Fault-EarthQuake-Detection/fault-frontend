export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/app/components/dashboard/DashBoardLayout';
import SettingsView from './SettingsView';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

const imageMetadata = {
  icons: {
    icon: "/asset/logo_geovalid.png",
  },
};

export const metadata: Metadata = {
  title: "Settings",
  description: "Aplikasi Validasi Data Geospasial untuk Deteksi Retakan pada Tebing dan Batuan",
  icons: imageMetadata.icons,
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');   

  return (
    <DashboardLayout user={user} showChatbot={true} showSidebar={true}>
      {/* Panggil Client Component SettingsView */}
      <SettingsView initialUser={user} />
    </DashboardLayout>
  );
}