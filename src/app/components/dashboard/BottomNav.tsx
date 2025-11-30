'use client';

import { Home, Search, MapPin, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    // Note 2: Wrapper untuk membuatnya floating di bawah
    // 'pointer-events-none' agar scroll bisa tembus
    <div className="fixed bottom-0 left-0 right-0 z-10 p-4 pointer-events-none">
      <nav
        className="
          mx-auto flex w-full max-w-xs items-center justify-around 
          rounded-full bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5
          pointer-events-auto // Aktifkan pointer untuk nav-nya saja
        "
      >
        <button className="flex flex-col items-center rounded-full p-3 text-blue-600 hover:bg-gray-100">
          {/* Note 3: strokeWidth={2.5} untuk ikon lebih bold */}
          <Home className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <button className="flex flex-col items-center rounded-full p-3 text-gray-500 hover:bg-gray-100">
          <Search className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <button className="flex flex-col items-center rounded-full p-3 text-gray-500 hover:bg-gray-100">
          <MapPin className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <button className="flex flex-col items-center rounded-full p-3 text-gray-500 hover:bg-gray-100">
          <Settings className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </nav>
    </div>
  );
}