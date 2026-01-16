"use client";

import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  X,
  Activity,
  Calendar,
  AlertTriangle,
  History // Ganti icon home jadi History biar relevan
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
        const { data, error } = await supabase
          .from("detection_reports")
          .select("id, status_level, fault_type, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(15); // NAIKKAN LIMIT karena spacenya sekarang luas

        if (error) {
          console.error("Gagal Ambil Riwayat:", error);
        } else if (data) {
          setReports(data);
        }
      };
      fetchHistory();
    }
  }, [user, supabase]);

  return (
    <aside
      className={`flex w-80 shrink-0 flex-col border-r bg-white z-50 ${className}`}
    >
      {/* Header Sidebar */}
      <div className="flex items-center justify-between p-5 border-b bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <History className="h-5 w-5 text-orange-600" />
          Riwayat Deteksi
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-200 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* List Riwayat (Full Height) */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200">
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
                  className={`p-3 rounded-xl border text-sm transition-all hover:shadow-md ${statusColor}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-900">
                      {item.fault_type || "Deteksi Sesar"}
                    </span>
                    {(status.includes("BAHAYA") ||
                      status.includes("PERINGATAN")) && (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs opacity-80 mt-2 font-medium">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                    })}
                  </div>
                  
                  <div className="mt-3 flex">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 bg-white/60 backdrop-blur-sm rounded-md border border-black/5 shadow-sm">
                        {item.status_level}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <Activity className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">Belum ada riwayat deteksi.</p>
            <Link
              href="/dashboard/detection"
              className="text-xs text-orange-600 font-bold hover:underline mt-2"
            >
              Mulai deteksi sekarang
            </Link>
          </div>
        )}
      </nav>

      {/* Footer (Info Singkat Saja) */}
      <div className="p-3 bg-gray-50 border-t text-center">
        <p className="text-[10px] text-gray-400">
            Menampilkan {reports.length} riwayat terbaru
        </p>
      </div>
    </aside>
  );
}