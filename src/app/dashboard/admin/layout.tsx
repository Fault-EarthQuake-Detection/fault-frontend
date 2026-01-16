/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Loader2,
  LayoutGrid,
  Users,
  PieChart as PieChartIcon,
  ArrowLeft,
  Menu,
  X, // <-- Tambah Icon Menu & X
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fault-dbservice.vercel.app/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <-- State Menu Mobile

  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  // --- LOGIC PENJAGA GERBANG (TETAP SAMA) ---
  useEffect(() => {
    const checkGate = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/auth/login");
          return;
        }

        const res = await fetch(`${API_URL}/admin/users`, {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          setIsAuthorized(true);
        } else {
          alert(
            "PERINGATAN: ANDA ADALAH USER, JANGAN MENCOBA-COBA MENJADI ADMIN!"
          );
          router.replace("/dashboard/home");
        }
      } catch (error) {
        router.replace("/dashboard/home");
      } finally {
        setIsLoading(false);
      }
    };
    checkGate();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        <p className="text-gray-500 font-medium text-sm">
          Verifikasi akses admin...
        </p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  // Function helper untuk Link (Biar codingan gak duplikat)
  const NavLink = ({ href, icon: Icon, label, mobile = false }: any) => (
    <Link
      href={href}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        isActive(href)
          ? "bg-orange-600 text-white shadow-md"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      } ${mobile ? "w-full p-3 bg-gray-50 border border-gray-100" : ""}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      {/* ================= HEADER SECTION ================= */}
      {/* bg-white & border-b memberikan garis pembatas */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-10 md:py-4">
            
            <div className="flex items-center justify-between relative min-h-[48px]">
                
                {/* 1. KIRI: Tombol Back */}
                {/* Absolute di Mobile agar judul bisa benar-benar di tengah */}
                <div className="absolute left-0 md:static z-10">
                    <button 
                        onClick={() => router.push('/dashboard/home')}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </div>

                {/* 2. TENGAH / JUDUL */}
                {/* Mobile: w-full & justify-center | Desktop: w-auto & justify-start */}
                <div className="w-full flex justify-center md:justify-start md:w-auto md:ml-4">
                    <h1 className="text-lg md:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 md:h-8 md:w-8 text-orange-600" fill="currentColor" fillOpacity={0.1} />
                        <span>Admin Console</span>
                    </h1>
                </div>

                {/* 3. KANAN: Navigasi */}
                
                {/* A. DESKTOP TABS (Pojok Kanan Atas) */}
                <div className="hidden md:flex items-center gap-1">
                    <div className="bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 flex gap-1">
                        <NavLink href="/dashboard/admin/validations" icon={LayoutGrid} label="Validasi" />
                        <NavLink href="/dashboard/admin/edit-roles" icon={Users} label="Pengguna" />
                        <NavLink href="/dashboard/admin/feedbacks" icon={PieChartIcon} label="Analisis" />
                    </div>
                </div>

                {/* B. MOBILE MENU BUTTON (Hamburger) */}
                <div className="absolute right-0 md:hidden z-10">
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm text-gray-600"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                    </button>
                </div>

            </div>

            {/* C. MOBILE DROPDOWN MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 animate-in slide-in-from-top-2">
                    <NavLink href="/dashboard/admin/validations" icon={LayoutGrid} label="Validasi" mobile />
                    <NavLink href="/dashboard/admin/edit-roles" icon={Users} label="Pengguna" mobile />
                    <NavLink href="/dashboard/admin/feedbacks" icon={PieChartIcon} label="Analisis" mobile />
                </div>
            )}
        </div>
      </div>

      {/* ================= CONTENT SECTION ================= */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10 pb-32 animate-fade-in">
        {children}
      </div>

    </div>
  );
}
