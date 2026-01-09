"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import {
  MapPin, AlertTriangle, Calendar, ExternalLink, Activity, X, User, Clock, Waves,
  Eye, Layers, Image as ImageIcon, ArrowUpCircle, Loader2
} from "lucide-react";

type ContentFeedProps = {
  user: SupabaseUser | null;
};

type FeedItem = {
  id: string;
  type: "news" | "detection";
  title: string;
  source: string;
  timestamp: Date;
  imageUrl: string | null;
  overlayUrl: string | null;
  maskUrl: string | null;
  statusLevel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  url?: string;
};

// --- HELPER FUNCTIONS ---
const long2tile = (lon: number, zoom: number) => {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
};

const lat2tile = (lat: number, zoom: number) => {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
};

const getGoogleSatelliteUrl = (lat: number, lng: number) => {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
  const zoom = 12;
  const x = long2tile(lng, zoom);
  const y = lat2tile(lat, zoom);
  return `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${zoom}`;
};

const parseBMKGCoord = (str: string | undefined): number | null => {
  if (!str) return null;
  const match = str.match(/(\d+(\.\d+)?)\s*([A-Za-z]+)/);
  if (!match) return null;
  let val = parseFloat(match[1]);
  const dir = match[3].toUpperCase();
  if (dir.includes("LS") || dir.includes("BB")) val = -val;
  return val;
};

// --- COMPONENT: MAP THUMBNAIL ---
const MapThumbnail = ({ src, alt }: { src: string | null; alt: string }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
        <MapPin className="h-8 w-8 text-gray-300 mb-2" />
        <span className="text-xs text-gray-400 font-medium">Lokasi Peta</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        unoptimized
        onError={() => setImgError(true)}
      />
      {src.includes("mt1.google.com") && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative -mt-6">
             <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping opacity-50"></div>
             <MapPin className="h-8 w-8 text-red-600 drop-shadow-md relative z-10" fill="white" />
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: DETECTION MODAL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DetectionModal({ item, onClose }: { item: any; onClose: () => void }) {
  const [viewMode, setViewMode] = useState<'original' | 'overlay' | 'mask'>('overlay');

  if (!item) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let detailInfo: any = {};
  try { detailInfo = JSON.parse(item.description || "{}"); } catch (e) { /* ignore */ }

  const original = item.original_image_url;
  const overlay = item.overlay_image_url;
  const mask = item.mask_image_url;

  let currentImage = original;
  if (viewMode === 'overlay') currentImage = overlay || original;
  else if (viewMode === 'mask') currentImage = mask || original;

  if (!currentImage && item.latitude && item.longitude) {
    currentImage = getGoogleSatelliteUrl(item.latitude, item.longitude);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" /> Detail Deteksi
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="h-5 w-5 text-gray-500" /></button>
        </div>

        <div className="overflow-y-auto p-0">
          <div className="relative w-full aspect-video bg-gray-900 overflow-hidden group">
            {/* Switcher Controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button onClick={() => setViewMode('original')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-lg backdrop-blur-md ${viewMode === 'original' ? 'bg-white text-black' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                    <ImageIcon className="h-3 w-3" /> Asli
                </button>
                <button onClick={() => setViewMode('overlay')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-lg backdrop-blur-md ${viewMode === 'overlay' ? 'bg-orange-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                    <Eye className="h-3 w-3" /> AI Overlay
                </button>
                <button onClick={() => setViewMode('mask')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-lg backdrop-blur-md ${viewMode === 'mask' ? 'bg-blue-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                    <Layers className="h-3 w-3" /> Masker
                </button>
            </div>

            <MapThumbnail src={currentImage} alt="Visual Detail" />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12 z-10 flex justify-between items-end">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${item.status_level?.includes("BAHAYA") ? "bg-red-500/90 text-white" : item.status_level?.includes("WASPADA") ? "bg-yellow-500/90 text-white" : "bg-yellow-500/90 text-white"}`}>
                {item.status_level?.includes("BAHAYA") && <AlertTriangle className="h-3 w-3" />}
                {item.status_level || "INFO"}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pola Retakan</p>
                <p className="font-semibold text-gray-900">{item.fault_type || "-"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Koordinat</p>
                <p className="font-mono text-xs text-gray-700 truncate">{item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}</p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-sm font-bold text-blue-800 mb-2">Analisis AI</h4>
              <p className="text-sm text-blue-900 leading-relaxed">{detailInfo.visual_statement || detailInfo.visual_description || "Tidak ada detail tambahan."}</p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={() => window.open(`http://googleusercontent.com/maps.google.com/?q=${item.latitude},${item.longitude}`, "_blank")} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition shadow-lg">
            <MapPin className="h-4 w-4" /> Buka Google Maps
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ContentFeed({ user }: ContentFeedProps) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(0); 
  const [newPostCount, setNewPostCount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDetection, setSelectedDetection] = useState<any>(null);
  
  const supabase = createClient();
  const observer = useRef<IntersectionObserver | null>(null);
  const ITEMS_PER_PAGE = 5;

  // --- 1. FETCH DATA ---
  const fetchPosts = async (pageNumber: number, isRefresh = false) => {
    try {
      if (pageNumber === 0) setLoading(true);
      else setLoadingMore(true);

      const from = pageNumber * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: reports, error } = await supabase
        .from("detection_reports")
        .select(`
          id, status_level, fault_type, original_image_url, overlay_image_url, mask_image_url, 
          created_at, latitude, longitude, description, user_id
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newDetections: FeedItem[] = (reports || []).map((item: any) => ({
        id: `det-${item.id}`,
        type: "detection",
        title: item.fault_type || "Laporan Deteksi Sesar",
        source: item.user_id === user?.id ? "Laporan Anda" : "Kontributor GeoValid",
        timestamp: new Date(item.created_at),
        imageUrl: item.original_image_url,
        overlayUrl: item.overlay_image_url,
        maskUrl: item.mask_image_url,
        statusLevel: item.status_level,
        data: item,
      }));

      // Fetch BMKG hanya di page 0
      const newsItems: FeedItem[] = [];
      if (pageNumber === 0 && isRefresh) {
        try {
          const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json");
          const data = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const gempaList = data?.Infogempa?.gempa || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gempaList.slice(0, 3).forEach((g: any) => {
            let displayImage = null;
            if (g.Shakemap) displayImage = `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}`;
            else {
               const lat = parseBMKGCoord(g.Lintang);
               const lng = parseBMKGCoord(g.Bujur);
               if(lat && lng) displayImage = getGoogleSatelliteUrl(lat, lng);
            }
            newsItems.push({
              id: `bmkg-${g.DateTime}`,
              type: "news",
              title: `Gempa Mag ${g.Magnitude} di ${g.Wilayah}`,
              source: "BMKG Indonesia",
              timestamp: new Date(g.DateTime),
              imageUrl: displayImage, overlayUrl: displayImage, maskUrl: displayImage,
              url: "https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg",
              data: g,
            });
          });
        } catch (e) { /* ignore */ }
      }

      // Combine & Filter Duplicates
      const incoming = [...newsItems, ...newDetections];
      
      setFeed(prev => {
        const combined = isRefresh ? incoming : [...prev, ...incoming];
        
        // --- FIX: Filter Duplicate ID ---
        const uniqueFeed = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        // Sort by timestamp desc
        return uniqueFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      });

      setHasMore(reports?.length === ITEMS_PER_PAGE);

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // --- 2. EFFECT ---
  useEffect(() => {
    fetchPosts(0, true);

    const channel = supabase
      .channel('realtime-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'detection_reports' }, () => {
        setNewPostCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 3. OBSERVER ---
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchPosts(nextPage);
            return nextPage;
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const handleLoadNewPosts = () => {
    setPage(0);
    setNewPostCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchPosts(0, true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 pb-24 relative z-30">
      <DetectionModal item={selectedDetection} onClose={() => setSelectedDetection(null)} />

      {newPostCount > 0 && (
        <div className="sticky top-4 z-40 flex justify-center animate-bounce">
          <button 
            onClick={handleLoadNewPosts}
            className="bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold hover:bg-orange-700 transition"
          >
            <ArrowUpCircle className="h-4 w-4" />
            {newPostCount} Postingan Baru
          </button>
        </div>
      )}

      <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 mt-4">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <Activity className="h-6 w-6" />
        </div>
        Informasi Terkini
      </h2>

      {loading && feed.length === 0 ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-4 shadow-sm h-64 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {feed.map((item, index) => {
            const isLastElement = feed.length === index + 1;
            return (
              <div
                ref={isLastElement ? lastPostElementRef : null}
                key={item.id} // Key is now unique
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                style={{ animationDelay: `${index % 5 * 100}ms` }}
                onClick={() => {
                  if (item.type === "news" && item.url) window.open(item.url, "_blank");
                  else if (item.type === "detection") setSelectedDetection(item.data);
                }}
              >
                <div className="p-5 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${item.type === "news" ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}>
                      {item.type === "news" ? <Waves className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">{item.source}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {item.type === "news" ? "BMKG Official" : "User Report"} • <Clock className="h-3 w-3" />
                        {item.timestamp.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {item.type === "news" && <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition" />}
                </div>

                <div className="px-5 pb-3">
                  <h3 className="font-bold text-gray-800 text-lg leading-snug mb-1 group-hover:text-blue-700 transition">{item.title}</h3>
                  {item.type === "detection" && item.statusLevel && (
                    <p className={`text-xs font-bold uppercase tracking-wide inline-block py-1 px-2 rounded-md ${item.statusLevel.includes("BAHAYA") ? "bg-red-50 text-red-600" : "bg-yellow-50-50 text-yellow-600"}`}>
                      {item.statusLevel}
                    </p>
                  )}
                </div>

                <div className="w-full aspect-[2/1] bg-gray-100 relative overflow-hidden">
                  <MapThumbnail src={item.overlayUrl || item.imageUrl} alt={item.title} />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loadingMore && (
        <div className="py-8 flex justify-center items-center text-gray-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
            <span className="text-sm">Memuat data lama...</span>
        </div>
      )}

      {!hasMore && feed.length > 0 && (
        <div className="py-8 text-center text-gray-400 text-xs">
            — Semua data telah ditampilkan —
        </div>
      )}
    </div>
  );
}