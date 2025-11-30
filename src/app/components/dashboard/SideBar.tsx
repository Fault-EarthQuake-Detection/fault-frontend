// src/components/dashboard/Sidebar.tsx

'use client';

import type { User as SupabaseUser } from '@supabase/supabase-js';
import { LogIn, X } from 'lucide-react';
import Link from 'next/link';

type SidebarProps = {
  user: SupabaseUser | null;
  className?: string;
  onClose?: () => void;
};

export default function Sidebar({ user, className = '', onClose }: SidebarProps) {
  const detectionHistory = [
    'Riwayat deteksi 1',
    'Riwayat deteksi 2',
    'Riwayat deteksi 3',
  ];

  return (
    // Note 1: Ubah w-64 menjadi w-80
    <aside
      className={`flex w-80 shrink-0 flex-col border-r bg-white p-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Riwayat Deteksi
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {user ? (
        <nav>
          <ul>
            {detectionHistory.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer border-b p-3 text-gray-600 hover:bg-gray-50"
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center">
          <LogIn className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Silakan{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:underline"
            >
              login
            </Link>{' '}
            untuk melihat riwayat deteksi Anda.
          </p>
        </div>
      )}
    </aside>
  );
}