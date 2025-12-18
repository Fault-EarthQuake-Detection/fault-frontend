'use client';

import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { 
  MapPin, AlertTriangle, Calendar, ExternalLink, 
  Activity, X, User, Clock, Waves 
} from 'lucide-react';

type ContentFeedProps = {
  user: SupabaseUser | null;
};

type FeedItem = {
  id: string;
  type: 'news' | 'detection';
  title: string;
  source: string;
  timestamp: Date;
  imageUrl: string | null;
  statusLevel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any; 
  url?: string;
};

// --- HELPER: GOOGLE MAPS TILE (TANPA API KEY/CC) ---
// Mengubah Lat/Long menjadi koordinat Tile X/Y Google Maps
const long2tile = (lon: number, zoom: number) => {
  return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
}

const lat2tile = (lat: number, zoom: number) => {
  return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}

const getGoogleSatelliteUrl = (lat: number, lng: number) => {
   if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
   
   // Zoom level 12 pas untuk melihat area sekitar
   const zoom = 12;
   const x = long2tile(lng, zoom);
   const y = lat2tile(lat, zoom);
   
   // Server mt1.google.com (lyrs=s adalah satelit, lyrs=y adalah hybrid)
   // Kita pakai 'y' (Hybrid) biar ada nama jalannya sedikit
   return `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${zoom}`;
}

const parseBMKGCoord = (str: string | undefined): number | null => {
  if (!str) return null;
  const match = str.match(/(\d+(\.\d+)?)\s*([A-Za-z]+)/);
  if (!match) return null;
  let val = parseFloat(match[1]);
  const dir = match[3].toUpperCase();
  if (dir.includes("LS") || dir.includes("BB")) val = -val;
  return val;
};

// --- KOMPONEN GAMBAR DENGAN PIN OVERLAY ---
const MapThumbnail = ({ src, alt }: { src: string | null; alt: string }) => {
  const [imgError, setImgError] = useState(false);

  // Fallback jika tidak ada gambar
  if (!src || imgError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300">
        <div className="h-14 w-14 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm mb-2">
          <MapPin className="h-7 w-7 text-slate-400" />
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lokasi Peta</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image 
        src={src} 
        alt={alt} 
        fill 
        className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" 
        unoptimized // PENTING: Agar server tidak memproses gambar eksternal
        onError={() => setImgError(true)}
      />
      {/* PIN OVERLAY (Buatan Sendiri biar keren) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="h-4 w-4 bg-red-600 rounded-full animate-ping absolute top-0 left-0 opacity-75"></div>
          <MapPin className="h-8 w-8 text-red-600 drop-shadow-lg relative z-10 -mt-8" fill="white" />
        </div>
      </div>
    </div>
  );
};

// --- 1. KOMPONEN MODAL DETAIL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DetectionModal({ item, onClose }: { item: any; onClose: () => void }) {
  if (!item) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let detailInfo: any = {};
  try {
    detailInfo = JSON.parse(item.description || '{}');
  } catch (e) { /* ignore */ }

  // Tentukan gambar utama modal
  let modalImage = item.original_image_url;
  // Jika tidak ada foto asli, gunakan peta Google
  if (!modalImage && item.latitude && item.longitude) {
    modalImage = getGoogleSatelliteUrl(item.latitude, item.longitude);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" /> Detail Analisis
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="h-5 w-5 text-gray-500" /></button>
        </div>

        <div className="overflow-y-auto p-0">
          <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
            {/* Pakai MapThumbnail agar ada Pin-nya */}
            <MapThumbnail src={modalImage} alt="Visual Detail" />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 z-20">
               <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${item.status_level?.includes('BAHAYA') ? 'bg-red-500/90 text-white' : item.status_level?.includes('WASPADA') ? 'bg-yellow-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
                {item.status_level?.includes('BAHAYA') && <AlertTriangle className="h-3 w-3" />}
                {item.status_level || 'INFO'}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-4">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(item.created_at).toLocaleDateString('id-ID')}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Pola</p><p className="font-semibold text-gray-900">{item.fault_type || "-"}</p></div>
               <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Koordinat</p><p className="font-mono text-xs text-gray-700 truncate">{item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}</p></div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><h4 className="text-sm font-bold text-blue-800 mb-2">Hasil Analisis AI</h4><p className="text-sm text-blue-900 leading-relaxed">{detailInfo.visual_statement || "Tidak ada detail tambahan."}</p></div>
            {detailInfo.fault_name && <div className="flex items-center gap-2 text-sm bg-red-50 text-red-700 p-3 rounded-lg border border-red-100"><MapPin className="h-4 w-4 shrink-0" /><span>Dekat dengan <strong>{detailInfo.fault_name}</strong></span></div>}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={() => window.open(`http://googleusercontent.com/maps.google.com/?q=${item.latitude},${item.longitude}`, '_blank')} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition shadow-lg"><MapPin className="h-4 w-4" /> Lihat di Peta</button>
        </div>
      </div>
    </div>
  );
}

// --- 2. KOMPONEN UTAMA ---
export default function ContentFeed({ user }: ContentFeedProps) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDetection, setSelectedDetection] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const combinedFeed: FeedItem[] = [];

      // A. DATA BMKG
      try {
        const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gempaList = data?.Infogempa?.gempa || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gempaList.forEach((g: any) => {
          const eventDate = g.DateTime ? new Date(g.DateTime) : new Date();
          let displayImage = null;
          
          if (g.Shakemap) {
            displayImage = `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}`;
          } else {
            const lat = parseBMKGCoord(g.Lintang);
            const lng = parseBMKGCoord(g.Bujur);
            if (lat !== null && lng !== null) {
              // --- PAKE GOOGLE SATELLITE ---
              displayImage = getGoogleSatelliteUrl(lat, lng);
            }
          }

          combinedFeed.push({
            id: `bmkg-${g.DateTime || Math.random()}`,
            type: 'news',
            title: `Gempa Mag ${g.Magnitude} di ${g.Wilayah}`,
            source: 'BMKG Indonesia',
            timestamp: eventDate,
            imageUrl: displayImage,
            url: 'https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg',
            data: g
          });
        });
      } catch (err) {
        console.error("Gagal ambil data BMKG:", err);
      }

      // B. DATA SUPABASE
      try {
        const { data: reports } = await supabase
          .from('detection_reports')
          .select(`
            id, status_level, fault_type, original_image_url, 
            created_at, latitude, longitude, description, user_id
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (reports) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reports.forEach((item: any) => {
            combinedFeed.push({
              id: `det-${item.id}`,
              type: 'detection',
              title: item.fault_type || "Laporan Deteksi Sesar",
              source: item.user_id === user?.id ? 'Laporan Anda' : 'Kontributor GeoValid',
              timestamp: new Date(item.created_at),
              imageUrl: item.original_image_url, 
              statusLevel: item.status_level,
              data: item
            });
          });
        }
      } catch (err) {
        console.error("Gagal ambil data DB:", err);
      }

      combinedFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setFeed(combinedFeed);
      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 pb-24 relative z-30">
      <DetectionModal item={selectedDetection} onClose={() => setSelectedDetection(null)} />

      <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Activity className="h-6 w-6" /></div>
        Informasi Terkini
      </h2>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => <div key={i} className="rounded-2xl border border-gray-100 p-4 shadow-sm h-64 bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {feed.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (item.type === 'news' && item.url) window.open(item.url, '_blank');
                else if (item.type === 'detection') setSelectedDetection(item.data);
              }}
            >
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${item.type === 'news' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                    {item.type === 'news' ? <Waves className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">{item.source}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {item.type === 'news' ? 'BMKG Official' : 'User Report'} • <Clock className="h-3 w-3" />
                      {item.timestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {item.type === 'news' && <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition" />}
              </div>

              <div className="px-5 pb-3">
                <h3 className="font-bold text-gray-800 text-lg leading-snug mb-1 group-hover:text-blue-700 transition">{item.title}</h3>
                {item.type === 'detection' && item.statusLevel && <p className={`text-xs font-bold uppercase tracking-wide inline-block py-1 px-2 rounded-md ${item.statusLevel.includes('BAHAYA') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{item.statusLevel}</p>}
              </div>

              <div className="w-full aspect-[2/1] bg-gray-100 relative overflow-hidden">
                {/* Visualisasi dengan MapThumbnail (Google Tile + Pin CSS) */}
                <MapThumbnail src={item.imageUrl} alt={item.title} />
                
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}