'use client';

import { Home, Search, MapPin, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 1. Import usePathname

export default function BottomNav() {
  const pathname = usePathname(); // 2. Ambil URL saat ini

  // 3. Fungsi helper untuk cek apakah link sedang aktif
  const isActive = (path: string) => pathname === path;

  // Class untuk tombol yang TIDAK aktif
  const inactiveClass = "flex flex-col items-center rounded-full p-3 text-gray-400 hover:bg-gray-100 hover:text-orange-500 transition-all duration-200";
  
  // Class untuk tombol yang SEDANG AKTIF (Active State)
  const activeClass = "flex flex-col items-center rounded-full p-3 text-orange-600 bg-orange-50 shadow-sm ring-1 ring-orange-100 transition-all duration-200 transform scale-105";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
      <nav className="mx-auto flex w-full max-w-xs items-center justify-around rounded-full bg-white/90 backdrop-blur-md p-2 shadow-xl ring-1 ring-black ring-opacity-5 pointer-events-auto">
        
        {/* HOME */}
        <Link href="/dashboard/home">
          <button className={isActive('/dashboard/home') ? activeClass : inactiveClass}>
            <Home className="h-6 w-6" strokeWidth={isActive('/dashboard/home') ? 3 : 2.5} />
          </button>
        </Link>

        {/* DETECTION */}
        <Link href="/dashboard/detection">
          <button className={isActive('/dashboard/detection') ? activeClass : inactiveClass}>
            <Search className="h-6 w-6" strokeWidth={isActive('/dashboard/detection') ? 3 : 2.5} />
          </button>
        </Link>

        {/* MAP */}
        <Link href="/dashboard/map">
          <button className={isActive('/dashboard/map') ? activeClass : inactiveClass}>
            <MapPin className="h-6 w-6" strokeWidth={isActive('/dashboard/map') ? 3 : 2.5} />
          </button>
        </Link>

        {/* SETTINGS */}
        <Link href="/dashboard/settings">
          <button className={isActive('/dashboard/settings') ? activeClass : inactiveClass}>
            <Settings className="h-6 w-6" strokeWidth={isActive('/dashboard/settings') ? 3 : 2.5} />
          </button>
        </Link>

      </nav>
    </div>
  );
}