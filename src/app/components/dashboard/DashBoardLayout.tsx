// src/components/dashboard/DashboardLayout.tsx

'use client';

import { useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Header from './Header';
import Sidebar from './SideBar';
import ContentFeed from './ContentFeed';
import ChatBot from './ChatBot';
import BottomNav from './BottomNav';
import ChatFab from './ChatFab'; // 1. Impor FAB baru

type LayoutProps = {
  user: SupabaseUser | null;
};

export default function DashboardLayout({ user }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-black">
      {/* Hapus onToggleChatbot dari Header */}
      <Header
        user={user}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Overlay (tidak berubah) */}
      {(isSidebarOpen || isChatOpen) && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsChatOpen(false);
          }}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* === Sidebar === */}
        {/* Note 1: Ubah w-64 -> w-80 */}
        <Sidebar user={user} className="hidden w-80 md:flex" />
        <Sidebar
          user={user}
          // Note 1: Ubah w-64 -> w-80
          className={`fixed inset-y-0 left-0 z-30 w-80 transform transition-transform md:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* === Konten Tengah === */}
        {/* Beri padding-bottom 16 (h-16 dari nav) di mobile */}
        <main className="flex-1 overflow-y-auto md:pb-0 pb-16">
          <ContentFeed user={user} />
        </main>

        {/* === ChatBot === */}
        {/* Note 1: Ukuran w-80 sudah pas (sama dengan sidebar) */}
        <ChatBot user={user} className="hidden w-80 lg:flex" />
        <ChatBot
          user={user}
          className={`fixed inset-y-0 right-0 z-30 w-80 transform transition-transform lg:hidden ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {/* === Mobile Nav & FAB === */}
      {/* Note 2: Tambahkan FAB di sini */}
      <ChatFab onClick={() => setIsChatOpen(true)} />
      {/* BottomNav hanya tampil di mobile */}
      <BottomNav />
    </div>
  );
}