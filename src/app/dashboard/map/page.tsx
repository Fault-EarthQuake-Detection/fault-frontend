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
        
        {/* Overlay Legenda */}
        <div className="absolute bottom-7 left-4 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs transition-all hover:scale-105">
          <h1 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-b pb-1">Legenda</h1>
          <div className="flex flex-col gap-2 text-xs text-gray-700 font-medium">
             <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700"></span> 
                Bahaya (Positif Sesar)
             </span>
             <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-700"></span> 
                Waspada (Perlu Verifikasi)
             </span>
             <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700"></span> 
                Aman (Hanya Data Anda)
             </span>
             <hr className="border-gray-300" />
             <span className="flex items-center gap-2">
                <span className="w-6 h-1 bg-red-500 opacity-60"></span> 
                Jalur Patahan Aktif
             </span>
          </div>
        </div>
        
        {/* Peta Fullscreen */}
        <div className="flex-1 relative z-0">
          {/* Hapus props detections, biarkan wrapper fetch sendiri */}
          <HistoryMapWrapper />
        </div>
      </div>
    </DashboardLayout>
  );
}