"use client";

import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  X,
  Activity,
  MapPin,
  Calendar,
  AlertTriangle,
  Settings,
  Shield,
  Home,
  Map
} from "lucide-react";
import Link from "next/link";

type SidebarProps = {
  user: SupabaseUser | null;
  className?: string;
  onClose?: () => void;
};

type Report = {
  id: number;
  status_level: string;
  fault_type: string;
  created_at: string;
};

export default function Sidebar({
  user,
  className = "",
  onClose,
}: SidebarProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const supabase = createClient();
  
  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        // Mengambil data riwayat dari tabel 'detection_reports'
        const { data, error } = await supabase
          .from("detection_reports")
          .select("id, status_level, fault_type, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10); // Batasi 10 riwayat terakhir

        // ... di dalam useEffect fetchHistory ...
        if (error) {
          // Ganti console.error lama dengan ini:
          console.error(
            "Detail Gagal Ambil Riwayat:",
            JSON.stringify(error, null, 2)
          );
        } else if (data) {
          setReports(data);
        }
        // ...
      };
      fetchHistory();
    }
  }, [user, supabase]);

  return (
    <aside
      className={`flex w-80 shrink-0 flex-col border-r bg-white p-4 z-50 ${className}`}
    >
      {/* Header Sidebar */}
      <div className="flex items-center justify-between pb-4 border-b mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-600" />
          Riwayat Deteksi
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* List Riwayat (Scrollable) */}
      <nav className="flex-1 overflow-y-auto">
        {reports.length > 0 ? (
          <ul className="space-y-3">
            {reports.map((item) => {
              const status = (item.status_level || "INFO").toUpperCase();
              let statusColor = "bg-gray-50 text-gray-600 border-gray-200";

              if (status.includes("BAHAYA") || status.includes("TINGGI")) {
                statusColor = "bg-red-50 text-red-700 border-red-200";
              } else if (
                status.includes("PERINGATAN") ||
                status.includes("WASPADA")
              ) {
                statusColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
              } else if (status.includes("AMAN")) {
                statusColor = "bg-green-50 text-green-700 border-green-200";
              }

              return (
                <li
                  key={item.id}
                  className={`p-3 rounded-lg border text-sm  ${statusColor}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-800">
                      {item.fault_type || "Deteksi Sesar"}
                    </span>
                    {(status.includes("BAHAYA") ||
                      status.includes("PERINGATAN")) && (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-70 mt-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/50 rounded w-fit">
                    {item.status_level}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            <p>Belum ada riwayat.</p>
            <Link
              href="/dashboard/detection"
              className="text-blue-600 font-medium hover:underline mt-2 block"
            >
              Mulai deteksi sekarang
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Sidebar (Aksi) */}
      <div className="mt-4 pt-4 border-t space-y-2">
        {/* Link home */}
        <Link
          href="/dashboard/home"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 py-2.5 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          <Home className="h-4 w-4" /> Beranda
        </Link>

        {/* Link Deteksi */}
        <Link
          href="/dashboard/detection"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 py-2.5 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          <Activity className="h-4 w-4" /> Deteksi
        </Link>

        {/* Link Maps */}
        <Link
          href="/dashboard/map"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 py-2.5 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          <MapPin className="h-4 w-4" /> Maps
        </Link>
        {/* Link Pengaturan */}
        <Link
          href="/dashboard/settings"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 py-2.5 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          <Settings className="h-4 w-4" /> Pengaturan
        </Link>
      </div>
    </aside>
  );
}
