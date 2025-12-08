// src/app/components/dashboard/BottomNav.tsx
'use client';

import { Home, Search, MapPin, Settings } from 'lucide-react';
import Link from 'next/link';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <nav className="mx-auto flex w-full max-w-xs items-center justify-around rounded-full bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 pointer-events-auto">
        
        <Link href="/">
          <button className="flex flex-col items-center rounded-full p-3 text-gray-500 hover:bg-gray-100 hover:text-orange-500">
            <Home className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </Link>

        <Link href="/dashboard/detection">
          <button className="flex flex-col items-center rounded-full p-3 text-gray-500 hover:bg-gray-100 hover:text-orange-500">
            <Search className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </Link>

        {/* --- UPDATE INI: Link ke Map Page --- */}
        <Link href="/dashboard/map">
          <button className="flex flex-col items-center rounded-full p-3  text-gray-500 hover:bg-gray-100 hover:text-orange-500">
            <MapPin className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </Link>
        {/* ------------------------------------ */}

        <Link href="/dashboard/settings">
          <button className="flex flex-col items-center rounded-full p-3 text-gray-500 hover:bg-gray-100 hover:text-orange-500 transition">
            <Settings className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </Link>
      </nav>
    </div>
  );
}