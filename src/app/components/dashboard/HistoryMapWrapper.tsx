'use client';

import dynamic from 'next/dynamic';

// Definisi ulang tipe data (agar type-safe)
type Detection = {
  id: number;
  latitude: number;
  longitude: number;
  original_image_url: string;
  status_level: string;
  fault_type?: string;
  created_at: string;
};

// Import komponen peta asli secara dynamic DI SINI (Client Side)
const HistoryMap = dynamic(() => import('./HistoryMap'), {
  ssr: false, // Opsi ini valid di sini karena file ini 'use client'
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
      Memuat Peta...
    </div>
  ),
});

export default function HistoryMapWrapper({ detections }: { detections: Detection[] }) {
  return <HistoryMap detections={detections} />;
}