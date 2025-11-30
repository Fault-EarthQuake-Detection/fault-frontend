"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { MapPin, User, Menu } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import Link from "next/link";
import { useState, useRef, useEffect } from "react"; // Impor hooks
import Image from "next/image";

type HeaderProps = {
  user: SupabaseUser | null;
  onToggleSidebar: () => void;
  // Prop onToggleChatbot sudah dihapus (sesuai kode Anda)
};

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  const username = user?.email ? user.email.split("@")[0] : "USERNAME";

  // State untuk mengelola dropdown menu profil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efek untuk menutup menu saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    // Tambahkan event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Hapus event listener saat unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white p-4 shadow-sm z-10">
      {/* Bagian Kiri: Tombol Menu (Mobile) + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
       
          <Image src="/logo_geovalid.png" alt="Logo" width={50} height={50} />
        
        <span className="text-xl font-bold text-gray-800">GEOVALID</span>
      </div>

      {/* Bagian Kanan: Tombol User/Login */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          // Tampilan JIKA SUDAH LOGIN
          <>
            {/* USERNAME DIPINDAHKAN KE SINI 
        Sekarang ini adalah item flex #1
      */}
            <span className="hidden text-sm font-medium uppercase text-gray-600 sm:inline">
              {username}
            </span>

            {/* DIV UNTUK DROPDOWN 
        Sekarang ini adalah item flex #2
        Container 'items-center' di atas akan menyejajarkannya dengan span
      */}
            <div className="relative" ref={menuRef}>
              {/* Tombol Profil untuk membuka menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="User menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <User className="h-9 w-9 rounded-full bg-gray-200 p-1.5 text-gray-600" />
              </button>

              {/* Dropdown Menu Sign Out */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="py-1" role="none">
                    {/* Info user di dalam dropdown */}
                    <div
                      className="block border-b px-4 py-2 text-sm text-gray-700"
                      role="none"
                    >
                      <span className="block font-medium" role="none">
                        Signed in as
                      </span>
                      <span
                        className="block truncate text-gray-500"
                        role="none"
                      >
                        {user.email}
                      </span>
                    </div>
                    {/* Tombol Sign Out dengan styling baru */}
                    <SignOutButton
                      className="
                  block w-full px-4 py-2 text-left text-sm 
                  text-red-600 hover:bg-gray-100
                "
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Tampilan JIKA BELUM LOGIN
          <>
            <Link
              href="/auth/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4"
            >
              Login
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:px-4"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
