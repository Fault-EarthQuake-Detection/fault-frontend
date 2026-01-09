/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, LayersControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { Search, Crosshair, CheckCircle2, AlertTriangle, Ruler, FileText, Loader2, MapPin } from 'lucide-react';
import type { Detection } from './HistoryMapWrapper';

// --- CUSTOM ICONS (Sama seperti sebelumnya) ---
const createCustomIcon = (type: 'verified' | 'unverified') => {
  const color = type === 'verified' ? '#10b981' : '#ef4444';
  const iconHtml = `
    <div style="position: relative; width: 36px; height: 36px; filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07));">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="${type === 'verified' ? '#064e3b' : '#7f1d1d'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
      <div style="position: absolute; top: -2px; right: -2px; background: white; border-radius: 50%; padding: 1px;">
        ${type === 'verified'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
        }
      </div>
    </div>`;
  return L.divIcon({ className: 'custom-map-icon', html: iconHtml, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
};

const Icons = { verified: createCustomIcon('verified'), unverified: createCustomIcon('unverified') };

// --- TYPE FOR SUGGESTION ---
type Suggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

// --- COMPONENT: SEARCH BAR GOOGLE MAPS STYLE ---
// Komponen ini ditaruh DI DALAM MapContainer agar bisa akses useMap()
// Tapi stylingnya kita buat Absolute Floating biar cantik
// ... import lainnya tetap sama

// GANTI component FloatingSearch dengan yang ini:
// ... (Kode import tetap sama)

// ... imports tetap sama

function FloatingSearch() {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestion saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // --- LOGIC FETCH MELALUI PROXY ---
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchLocation = async () => {
      if (!query || query.length <= 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      
      try {
        // PERUBAHAN DISINI: Kita fetch ke API internal kita sendiri
        const safeQuery = encodeURIComponent(query);
        const res = await fetch(`/api/search-location?q=${safeQuery}`, { signal });

        if (!res.ok) throw new Error("API Error");
        
        const data = await res.json();
        
        if (!signal.aborted) {
            setSuggestions(data || []);
            setShowSuggestions(true);
        }

      } catch (e: any) {
        if (e.name !== 'AbortError') {
             // console.warn("Search info:", e.message); // Uncomment untuk debug
        }
      } finally {
        if (!signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchLocation();
    }, 500); // Debounce bisa lebih cepat karena kita pakai proxy sendiri (500ms)

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectLocation = (lat: string, lon: string, name: string) => {
    map.flyTo([parseFloat(lat), parseFloat(lon)], 16, { animate: true, duration: 1.5 });
    setQuery(name); 
    setShowSuggestions(false);
  };

  const handleLocateMe = () => {
    setIsSearching(true);
    map.locate({ setView: true, maxZoom: 16 })
      .on("locationfound", () => setIsSearching(false))
      .on("locationerror", (e) => {
        setIsSearching(false);
        alert("Gagal mendeteksi lokasi: " + e.message);
      });
  };

  return (
    <div 
      ref={wrapperRef}
      className="absolute top-4 left-4 right-4 md:right-auto md:w-96 z-[1000] flex flex-col gap-2 pointer-events-auto font-sans"
    >
      <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-12 transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
        <div className="pl-4 text-gray-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Cari lokasi (Kecamatan, Desa)..." 
          className="flex-1 px-3 py-2 outline-none text-gray-700 text-sm h-full bg-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
        />
        {isSearching && (
          <div className="pr-3 animate-spin text-blue-500">
            <Loader2 size={18} />
          </div>
        )}
        
        <div className="border-l h-6 border-gray-200 mx-1"></div>
        <button 
          onClick={handleLocateMe}
          className="px-4 h-full hover:bg-gray-50 text-blue-600 transition-colors flex items-center justify-center active:bg-blue-100"
          title="Lokasi Saya"
        >
          <Crosshair size={20} />
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col mt-1 animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.place_id}
              onClick={() => handleSelectLocation(item.lat, item.lon, item.display_name)}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-b-0 border-gray-50 transition-colors group"
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-1 group-hover:text-orange-500 shrink-0" />
              <span className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                {item.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ... (Sisa file tetap sama)

// ... Sisanya (HistoryMap export default) tetap sama

// --- MAIN COMPONENT ---
export default function HistoryMap({ detections }: { detections: Detection[] }) {
  const safeDetections = Array.isArray(detections) ? detections : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/patahan_aktif.geojson')
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error("Gagal load GeoJSON", err));
  }, []);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[-2.5, 118]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false} // Matikan zoom default biar layout bersih
      >
        {/* --- MAP LAYERS --- */}
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Peta Jalan"><TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelit"><TileLayer attribution='&copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topografi"><TileLayer attribution='&copy; OpenTopoMap' url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" /></LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Sesar Aktif">
             {geoJsonData && <GeoJSON data={geoJsonData} style={{ color: '#ef4444', weight: 3, opacity: 0.7, dashArray: '5, 5' }} />}
          </LayersControl.Overlay>
        </LayersControl>

        {/* --- CUSTOM FLOATING SEARCH BAR --- */}
        <FloatingSearch />

        {/* --- MARKERS RENDER --- */}
        {safeDetections.map((item) => {
          if (!item.latitude || !item.longitude) return null;
          const isVerified = item.is_validated === true;
          
          // Parsing Data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let detailInfo: any = {};
          try {
             if (item.description) detailInfo = JSON.parse(item.description);
          } catch (e) { /* ignore */ }

          const rawDistance = detailInfo.fault_distance; 
          const distanceText = rawDistance !== undefined && rawDistance !== null 
            ? `${Number(rawDistance).toFixed(2)} km` : "Data jarak tidak tersedia";
          const aiAnalysis = detailInfo.visual_statement || item.description || "Analisis sedang diproses...";
          const displayImage = item.overlay_image_url || item.original_image_url;
          const isOverlay = !!item.overlay_image_url;

          return (
            <Marker key={item.id} position={[item.latitude, item.longitude]} icon={isVerified ? Icons.verified : Icons.unverified}>
              <Popup className="custom-popup-width" maxWidth={320}>
                <div className="flex flex-col gap-3 font-sans">
                  {/* ... (Isi Popup sama persis seperti sebelumnya) ... */}
                  {/* HEADER */}
                  <div className="flex justify-between items-center border-b pb-2 border-gray-100">
                    <span className="text-xs font-bold text-gray-500">ID: #{item.id}</span>
                    {isVerified ? (
                      <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
                        <CheckCircle2 size={10} /> TERVERIFIKASI
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold border border-gray-200">
                        <AlertTriangle size={10} /> USER REPORT
                      </span>
                    )}
                  </div>

                  {/* IMAGE */}
                  <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden group border border-gray-200 shadow-sm">
                    {displayImage ? (
                      <>
                        <Image src={displayImage} alt="Deteksi" fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px"/>
                        <div className={`absolute bottom-0 left-0 right-0 text-white text-[10px] p-1 text-center backdrop-blur-sm ${isOverlay ? 'bg-blue-600/80' : 'bg-gray-800/60'}`}>
                          {isOverlay ? "Visualisasi AI" : "Original Image"}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                    )}
                  </div>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                       <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Pola</p>
                       <p className="text-sm font-bold text-gray-800 truncate">{item.fault_type || "-"}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                       <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Status</p>
                       <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${
                         item.status_level?.includes('BAHAYA') ? 'bg-red-100 text-red-700' : 
                         item.status_level?.includes('WASPADA') ? 'bg-yellow-100 text-yellow-700' : 
                         'bg-green-100 text-green-700'
                       }`}>
                         {item.status_level || "AMAN"}
                       </span>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-2 text-xs text-gray-600 bg-blue-50/40 p-2.5 rounded border border-blue-100">
                    <div className="flex items-start gap-2">
                       <Ruler size={14} className="mt-0.5 text-blue-600 shrink-0" />
                       <div>
                         <span className="font-bold text-blue-900 block">Jarak Sesar Terdekat:</span>
                         <span className="font-mono text-gray-800 bg-white/50 px-1 rounded font-bold">{distanceText}</span>
                       </div>
                    </div>
                    <div className="flex items-start gap-2 pt-2 border-t border-blue-200/50">
                       <FileText size={14} className="mt-0.5 text-blue-600 shrink-0" />
                       <div>
                         <span className="font-bold text-blue-900 block">Analisis Sistem:</span>
                         <p className="leading-relaxed text-gray-700 mt-1 line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">{aiAnalysis}</p>
                       </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <p className="text-[10px] text-gray-400 text-right mt-1">
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}