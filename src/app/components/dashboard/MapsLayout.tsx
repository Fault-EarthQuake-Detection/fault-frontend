'use client';

import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type MapsLayoutProps = {
  children: ReactNode;
};

export default function MapsLayout({ children }: MapsLayoutProps) {
  return (
    // Gunakan h-screen agar layout mengisi seluruh tinggi layar
    <div className="flex h-screen flex-col bg-gray-50">
      
      {/* Header Sederhana untuk Maps (Opsional, bisa dihapus jika ingin benar-benar full) */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
          <Link href="/dashboard" className="pointer-events-auto inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md text-gray-700 hover:bg-white transition">
             <ArrowLeft className="h-5 w-5" />
             <span className="text-sm font-semibold pr-2 hidden sm:inline">Kembali ke Dashboard</span>
          </Link>
      </header>

      {/* Konten Utama (Peta) mengisi sisa ruang */}
      <main className="flex-1 relative z-0 overflow-hidden">
        {children}
      </main>

      {/* Navigasi Bawah tetap ada untuk navigasi */}
      <BottomNav />
    </div>
  );
}