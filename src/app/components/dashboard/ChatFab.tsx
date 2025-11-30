// src/components/dashboard/ChatFab.tsx

'use client';

import { MessageCircle } from 'lucide-react';

type ChatFabProps = {
  onClick: () => void;
};

export default function ChatFab({ onClick }: ChatFabProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-20 right-4 z-20 // 16px dari kanan, 80px dari bawah
        flex h-16 w-16 items-center justify-center 
        rounded-full bg-orange-800 text-white 
        shadow-lg md:hidden // Sembunyikan di desktop
      "
      aria-label="Open Chatbot"
    >
      {/* Ikon dibuat lebih tebal agar konsisten */}
      <MessageCircle className="h-8 w-8" strokeWidth={2.5} />
    </button>
  );
}