'use client';

import { useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Header from './Header';
import Sidebar from './SideBar';
import ContentFeed from './ContentFeed';
import ChatBot from './ChatBot';
import BottomNav from './BottomNav';
import ChatFab from './ChatFab';

type LayoutProps = {
  user: SupabaseUser | null;
  children?: React.ReactNode;
  // Tambahkan props untuk mengontrol visibilitas
  showSidebar?: boolean;
  showChatbot?: boolean;
};

export default function DashboardLayout({ 
  user, 
  children,
  showSidebar = true, // Default tampil
  showChatbot = true  // Default tampil
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-black">
      {/* Header selalu tampil */}
      <Header
        user={user}
        // Matikan toggle jika sidebar disembunyikan
        onToggleSidebar={() => showSidebar && setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Overlay */}
      {(isSidebarOpen || isChatOpen) && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsChatOpen(false);
          }}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* === Sidebar (Kondisional) === */}
        {showSidebar && (
          <>
            <Sidebar user={user} className="hidden w-80 md:flex" />
            <Sidebar
              user={user}
              className={`fixed inset-y-0 left-0 z-30 w-80 transform transition-transform md:hidden ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
              onClose={() => setIsSidebarOpen(false)}
            />
          </>
        )}

        {/* === Konten Tengah === */}
        <main className="flex-1 overflow-y-auto md:pb-0 pb-16 relative">
          {children ? children : <ContentFeed user={user} />}
        </main>

        {/* === ChatBot (Kondisional) === */}
        {showChatbot && (
          <>
            <ChatBot user={user} className="hidden w-80 lg:flex" />
            <ChatBot
              user={user}
              className={`fixed inset-y-0 right-0 z-30 w-80 transform transition-transform lg:hidden ${
                isChatOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              onClose={() => setIsChatOpen(false)}
            />
          </>
        )}
      </div>

      {/* FAB Chatbot (Kondisional) */}
      {showChatbot && <ChatFab onClick={() => setIsChatOpen(true)} />}
      
      {/* Navigasi Bawah selalu tampil untuk navigasi mobile */}
      <BottomNav />
    </div>
  );
}