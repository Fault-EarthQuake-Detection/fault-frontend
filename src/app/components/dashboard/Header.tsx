"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User, Menu, Settings } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type HeaderProps = {
  user: SupabaseUser | null;
  onToggleSidebar: () => void;
};

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  // --- LOGIKA UTAMA: AMBIL DATA DARI METADATA ---
  // Kita cek user_metadata dulu (hasil update profil), baru fallback ke email
  const username = user?.user_metadata?.username || (user?.email ? user.email.split("@")[0] : "Pengguna");
  const avatarUrl = user?.user_metadata?.avatar_url;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup menu saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white p-4 shadow-sm z-20 relative">
      {/* Bagian Kiri: Toggle Sidebar & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 justify-center md:justify-start">
        <Link href="/dashboard" className="flex items-center h-screen gap-2">
          <Image 
            src="/asset/logo_geovalid.png" 
            alt="Logo" 
            width={40} 
            height={40} 
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-black tracking-wide uppercase text-gray-800 sm:block">
            GEOVALID
          </span>
        </Link>
      </div>

      {/* Bagian Kanan: Profil User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user ? (
          <>
            {/* Tampilkan Nama (Hanya di layar besar) */}
            <span className="hidden text-sm font-bold text-gray-700 sm:inline max-w-[150px] truncate text-right">
              {username}
            </span>

            {/* Dropdown Profil */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition"
              >
                {/* Logika Avatar: Prioritaskan Gambar URL */}
                <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative shadow-sm">
                  {avatarUrl ? (
                    <Image 
                      src={avatarUrl} 
                      alt="Profile" 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-2 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Isi Menu Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in overflow-hidden">
                  
                  {/* Header Dropdown */}
                  <div className="px-4 py-4 border-b bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-2">
                    <Link 
                      href="/dashboard/settings" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Pengaturan Akun
                    </Link>
                    
                    <div className="border-t my-1"></div>
                    
                    <div className="px-2">
                      <SignOutButton 
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-semibold transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Jika Belum Login
          <div className="flex gap-2">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Masuk
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg bg-orange-700 px-5 py-2 text-sm font-bold text-white hover:bg-orange-800 shadow-md transition"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}