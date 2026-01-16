"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  User,
  Menu,
  Settings,
  ChevronDown,
  Loader2,
  Home,
  Activity,
  MapPin,
  Shield,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation"; // Import Pathname

type HeaderProps = {
  user: SupabaseUser | null;
  onToggleSidebar: () => void;
  showSidebarToggle?: boolean;
};

const DB_API_URL = "https://fault-dbservice.vercel.app/api";

export default function Header({
  user,
  onToggleSidebar,
  showSidebarToggle = true,
}: HeaderProps) {
  const [dbRole, setDbRole] = useState<string | null>(null);
  const [dbUsername, setDbUsername] = useState<string | null>(null);
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const pathname = usePathname(); // Init Pathname

  // --- HELPER UNTUK NAVIGASI TENGAH ---
  const getNavClass = (path: string) => {
    // Logic: path '/dashboard/home' cocok dengan '/dashboard/home'
    // Tapi untuk admin, '/dashboard/admin/validations' harus cocok dengan '/dashboard/admin'
    const isActive = pathname.startsWith(path);

    return `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-orange-600 text-white shadow-md font-bold" // Warna BEDA saat aktif (Orange Solid)
        : "text-gray-600 hover:bg-gray-100 hover:text-orange-600" // Warna normal
    }`;
  };

  useEffect(() => {
    const fetchRealProfile = async () => {
      if (!user) return;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(`${DB_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const profile = await res.json();
          setDbRole(profile.role);
          setDbUsername(profile.username);
          setDbAvatar(profile.avatarUrl);
        }
      } catch (err) {
        console.error("Gagal sync profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchRealProfile();
  }, [user, supabase]);

  const displayName = dbUsername || user?.user_metadata?.username || "Pengguna";
  const displayAvatar = dbAvatar || user?.user_metadata?.avatar_url;
  const isAdmin = dbRole === "ADMIN";

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
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-4 md:px-6 shadow-sm z-40 md:z-50 relative sticky top-0">
      {/* 1. KIRI (LOGO & HAMBURGER) - Layout Tetap */}
      <div className="flex items-center gap-3">
        {/* 3. BUNGKUS TOMBOL MENU DENGAN KONDISI INI */}
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        <Link href="/dashboard/home" className="flex items-center gap-2 group">
          <Image
            src="/asset/logo_geovalid.png"
            alt="Logo"
            width={32}
            height={32}
            className="object-contain transition-transform group-hover:scale-110"
          />
          <span className="text-lg font-black tracking-wide uppercase text-gray-800 sm:block">
            GEO<span className="text-orange-600">VALID</span>
          </span>
        </Link>
      </div>

      {/* 2. TENGAH (NAVIGASI BARU) - Hanya di Desktop */}
      <nav className="hidden md:flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
        <Link href="/dashboard/home" className={getNavClass("/dashboard/home")}>
          <Home className="h-4 w-4" /> Home
        </Link>
        <Link
          href="/dashboard/detection"
          className={getNavClass("/dashboard/detection")}
        >
          <Activity className="h-4 w-4" /> Detection
        </Link>
        <Link href="/dashboard/map" className={getNavClass("/dashboard/map")}>
          <MapPin className="h-4 w-4" /> Maps
        </Link>
        <Link
          href="/dashboard/settings"
          className={getNavClass("/dashboard/settings")}
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </nav>

      {/* 3. KANAN (PROFIL USER) - Layout Tetap */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-full pl-2 pr-1 py-1 hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-gray-700 truncate max-w-[100px]">
                  {loadingProfile ? "..." : displayName}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isAdmin ? "text-orange-600" : "text-gray-400"
                  }`}
                >
                  {loadingProfile ? "..." : isAdmin ? "Administrator" : "User"}
                </p>
              </div>

              <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative shadow-sm">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-2 text-gray-400" />
                )}
              </div>

              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 hidden sm:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 overflow-hidden border border-gray-100 ">
                {/* Header Mobile */}
                <div className="px-4 py-3 border-b bg-gray-50 sm:hidden">
                  <p className="text-sm font-bold text-gray-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <div className="p-1">
                  {/* BUTTON ADMIN (Hanya Tampil Jika fetch API berhasil return role ADMIN) */}
                  {isAdmin && (
                    <Link
                      href="/dashboard/admin"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-black transition mb-1 mx-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-orange-400" />
                      Admin Console
                    </Link>
                  )}

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Pengaturan Akun
                  </Link>

                  <div className="h-px bg-gray-100 my-1"></div>

                  <div className="px-1">
                    <SignOutButton className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Masuk
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
