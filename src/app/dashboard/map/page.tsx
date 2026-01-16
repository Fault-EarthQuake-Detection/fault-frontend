export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/app/components/dashboard/DashBoardLayout';
import HistoryMapWrapper from '@/app/components/dashboard/HistoryMapWrapper'; 
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

const imageMetadata = {
  icons: {
    icon: "/asset/logo_geovalid.png",
  },
};

export const metadata: Metadata = {
  title: "Maps",
  description: "Aplikasi Validasi Data Geospasial",
  icons: imageMetadata.icons,
};

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // GAK PERLU FETCH DATA DI SINI LAGI
  // Biarkan HistoryMapWrapper yang handle fetch di client side 
  // supaya bisa dapet data realtime & lengkap (overlay, description, dll).

  return (
    <DashboardLayout user={user} showSidebar={false} showChatbot={false}>
      <div className="flex h-full w-full flex-col relative z-30">
        
        
        {/* Peta Fullscreen */}
        <div className="flex-1 relative z-0">
          {/* Hapus props detections, biarkan wrapper fetch sendiri */}
          <HistoryMapWrapper />
        </div>
      </div>
    </DashboardLayout>
  );
}