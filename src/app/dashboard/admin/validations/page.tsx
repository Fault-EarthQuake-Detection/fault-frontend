/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  User,
  MapPin, // Icon MapPin tetap dipakai untuk tombol baru
  Image as ImageIcon,
  Maximize2,
  X,
  Shield,
  ExternalLink, // Tambah Icon External Link
} from "lucide-react";
import Image from "next/image";

// Pastikan arahkan ke Port Backend yang benar
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fault-dbservice.vercel.app/api";

export default function ValidationsPage() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [selectedReport, setSelectedReport] = useState<any>(null);

  const supabase = createClient();
  const observer = useRef<IntersectionObserver | null>(null);

  // --- LOGIC INFINITE SCROLL ---
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // --- FETCH DATA ---
  const fetchData = async (pageNum: number) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch per 3 item
      const res = await fetch(
        `${API_URL}/admin/detections?page=${pageNum}&limit=3`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );

      if (res.ok) {
        const json = await res.json();
        const newData = Array.isArray(json) ? json : json.data || [];

        if (newData.length < 3) setHasMore(false);

        setDataList((prev) => {
          const combined = [...prev, ...newData];
          return Array.from(
            new Map(combined.map((item) => [item.id, item])).values()
          );
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // --- ACTIONS ---
  const handleValidate = async (id: number, isValid: boolean) => {
    setDataList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isValidated: isValid } : item
      )
    );

    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/admin/detections/${id}/validate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ isValid }),
    });
    setSelectedReport(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus permanen?")) return;

    setDataList((prev) => prev.filter((item) => item.id !== id));
    setSelectedReport(null);

    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/admin/detections/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
  };

  // --- MODAL ---
  const ReportDetailModal = ({
    report,
    onClose,
  }: {
    report: any;
    onClose: () => void;
  }) => {
    const [viewMode, setViewMode] = useState<"original" | "overlay" | "mask">(
      "overlay"
    );
    let aiAnalysis = { visual_statement: report.description };
    try {
      aiAnalysis = JSON.parse(report.description || "{}");
    } catch (e) {}
    const currentImage =
      viewMode === "original"
        ? report.originalImageUrl
        : viewMode === "mask"
        ? report.maskImageUrl || report.originalImageUrl
        : report.overlayImageUrl || report.originalImageUrl;

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
          <div className="w-full md:w-2/3 bg-black relative flex flex-col">
            <div className="flex-1 relative">
              <Image
                src={currentImage}
                alt="Detail"
                fill
                className="object-contain"
                unoptimized
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full md:hidden"
              >
                <X />
              </button>
            </div>
            <div className="bg-gray-900 p-4 flex justify-center gap-4 border-t border-gray-800">
              {["original", "overlay", "mask"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase ${
                    viewMode === mode
                      ? "bg-orange-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-white p-6 flex flex-col border-l">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="text-orange-600 h-5 w-5" /> Detail #
                {report.id}
              </h2>
              <button
                onClick={onClose}
                className="hidden md:block hover:bg-gray-100 p-2 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="flex items-center gap-3 mt-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full overflow-hidden relative">
                  {report.user?.avatarUrl ? (
                    <Image
                      src={report.user.avatarUrl}
                      alt="Ava"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="p-1 h-full w-full text-gray-400" />
                  )}
                </div>
                <span className="font-bold text-sm">
                  {report.user?.username || "Anonim"}
                </span>
              </div>
              
              {/* BUTTON MAPS DI MODAL JUGA (Opsional, tapi berguna) */}
              {report.latitude && report.longitude && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    <MapPin className="h-4 w-4" /> Buka Lokasi di Google Maps
                    <ExternalLink className="h-3 w-3 ml-auto opacity-50"/>
                  </a>
              )}

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Maximize2 className="h-3 w-3" /> Analisis AI
                </h4>
                <p>{aiAnalysis.visual_statement || report.description}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t space-y-3">
              {!report.isValidated ? (
                <button
                  onClick={() => handleValidate(report.id, true)}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex justify-center gap-2"
                >
                  <CheckCircle2 /> Validasi
                </button>
              ) : (
                <button
                  onClick={() => handleValidate(report.id, false)}
                  className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 flex justify-center gap-2"
                >
                  <XCircle /> Batalkan
                </button>
              )}
              <button
                onClick={() => handleDelete(report.id)}
                className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 flex justify-center gap-2"
              >
                <Trash2 /> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {dataList.map((report, index) => {
          const isLastElement = dataList.length === index + 1;

          return (
            <div
              key={`${report.id}-${index}`}
              ref={isLastElement ? lastElementRef : null}
              onClick={() => setSelectedReport(report)}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col animate-in fade-in zoom-in duration-300 relative"
            >
              <div className="relative h-48 bg-gray-100">
                {report.overlayImageUrl ? (
                  <Image
                    src={report.overlayImageUrl}
                    alt="Img"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <ImageIcon />
                  </div>
                )}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur shadow-sm">
                  {report.isValidated ? (
                    <span className="text-green-600">Terverifikasi</span>
                  ) : (
                    <span className="text-orange-600">Pending</span>
                  )}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-2">
                  {report.faultType || "Pola Unknown"}
                </h3>
                
                {/* --- UPDATE: TOMBOL GOOGLE MAPS DI SINI --- */}
                {/* Hapus text alamat lama, ganti dengan tombol ini */}
                {report.latitude && report.longitude ? (
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        // PENTING: e.stopPropagation() agar tidak membuka modal detail saat tombol diklik
                        onClick={(e) => e.stopPropagation()} 
                        className="mt-auto inline-flex items-center self-start gap-2 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
                    >
                        <MapPin className="h-3 w-3" />
                        Lihat Peta
                    </a>
                ) : (
                    <span className="mt-auto text-xs text-gray-400 italic flex items-center gap-1">
                        <MapPin className="h-3 w-3"/> Koordinat tidak tersedia
                    </span>
                )}
              </div>
            </div>
          );
        })}

        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-64 animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
      </div>

      {!hasMore && dataList.length > 0 && (
        <div className="text-center text-gray-400 text-sm mt-4">
          Semua data telah dimuat.
        </div>
      )}

      {dataList.length === 0 && !loading && (
        <p className="text-gray-400 text-center py-10">Data kosong.</p>
      )}
    </>
  );
}