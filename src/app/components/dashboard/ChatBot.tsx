'use client';

import type { User as SupabaseUser } from '@supabase/supabase-js';
import { LogIn, Send, X } from 'lucide-react'; // Impor X
import Link from 'next/link';

type ChatBotProps = {
  user: SupabaseUser | null;
  className?: string; // Prop untuk menerima class
  onClose?: () => void; // Prop untuk menutup di mobile
};

export default function ChatBot({ user, className = '', onClose }: ChatBotProps) {
  return (
    <aside
      className={`flex w-80 shrink-0 flex-col border-l bg-white z-50 md:z-40 ${className}`}
    >
      {/* Header Chatbot */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b p-4 text-center">
        {/* Spacer agar judul tetap di tengah */}
        <div className="w-6"></div>
        <h2 className="flex-1 text-center font-semibold text-gray-800">
          GEO ChatBot
        </h2>
        {/* Tombol Close (Hanya tampil di mobile/jika onClose ada) */}
        {onClose ? (
          <button
            onClick={onClose}
            className="w-6 rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close Chatbot"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-6"></div> // Spacer untuk desktop
        )}
      </div>

      {user ? (
        // ... (Sisa kode sama, pastikan layout flex-nya benar)
        <>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="flex justify-end">
              <div className="max-w-xs rounded-lg bg-gray-200 p-3">
                <p className="text-sm text-black">
                  Bagaimana cara mengantisipasi gempa?
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-xs rounded-lg bg-blue-600 p-3 text-white">
                <p className="text-sm">Menurut BMKG, Anda harus...</p>
              </div>
            </div>
          </div>
          {/* Input Chat */}
          <div className="flex items-center gap-2 border-t p-4">
            <input
              type="text"
              placeholder="Ketik pesan..."
              className="flex-1 rounded-full border bg-gray-100 px-4 py-2 text-sm text-black"
            />
            <button className="rounded-full p-2 text-blue-600 hover:bg-gray-100">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </>
      ) : (
        // ... (Sisa kode sama)
        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <LogIn className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Silakan{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:underline"
            >
              login
            </Link>{' '}
            untuk menggunakan GEO ChatBot.
          </p>
        </div>
      )}
    </aside>
  );
}