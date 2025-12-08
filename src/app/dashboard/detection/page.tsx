// src/app/dashboard/detection/page.tsx
export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/app/components/dashboard/DashBoardLayout';
import DetectionView from './DetectionView';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

const imageMetadata = {
  icons: {
    icon: "/asset/logo_geovalid.png",
  },
};

export const metadata: Metadata = {
  title: "Detection",
  description: "Aplikasi Validasi Data Geospasial untuk Deteksi Retakan pada Tebing dan Batuan",
  icons: imageMetadata.icons,
};

export default async function DetectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteksi server-side: jika tidak login, lempar ke login
  if (!user) {
    redirect('/auth/login');
  }

  // Bungkus DetectionView dengan layout dashboard
  // Note: Kita perlu mengoper prop 'children' ke DashboardLayout jika layout tersebut mendukungnya.
  // Tapi berdasarkan kode DashBoardLayout.tsx yang Anda upload sebelumnya, 
  // layout tersebut merender 'ContentFeed' secara hardcoded di <main>.
  
  // SOLUSI: Kita gunakan DashboardLayout sebagai wrapper, 
  // tapi kita perlu sedikit memodifikasi DashboardLayout agar bisa menerima 'children'.
  
  return (
    <DashboardLayout user={user}>
       <DetectionView />
    </DashboardLayout>
  );
}