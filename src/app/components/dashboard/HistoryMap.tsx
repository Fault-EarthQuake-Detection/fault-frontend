/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  GeoJSON,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {
  Search,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  Ruler,
  FileText,
  Loader2,
  MapPin,
  Info,
  Activity,
  Layers,
} from "lucide-react";
import type { Detection } from "./HistoryMapWrapper";

// --- CUSTOM ICONS ---
const createCustomIcon = (type: "verified" | "unverified") => {
  const color = type === "verified" ? "#10b981" : "#ef4444";
  const iconHtml = `
    <div style="position: relative; width: 36px; height: 36px; filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07));">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="${
    type === "verified" ? "#064e3b" : "#7f1d1d"
  }" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
      <div style="position: absolute; top: -2px; right: -2px; background: white; border-radius: 50%; padding: 1px;">
        ${
          type === "verified"
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
        }
      </div>
    </div>`;
  return L.divIcon({
    className: "custom-map-icon",
    html: iconHtml,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const Icons = {
  verified: createCustomIcon("verified"),
  unverified: createCustomIcon("unverified"),
};

// --- TYPE FOR SUGGESTION ---
type Suggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

// --- COMPONENT: CUSTOM LAYER CONTROL (BARU) ---
function FloatingLayerControl({
  activeBase,
  setActiveBase,
  showFaults,
  setShowFaults,
}: {
  activeBase: string;
  setActiveBase: (v: string) => void;
  showFaults: boolean;
  setShowFaults: (v: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseLayers = [
    { id: "osm", name: "Peta Jalan" },
    { id: "satelit", name: "Satelit" },
    { id: "topo", name: "Topografi" },
  ];

  return (
    <div
      ref={containerRef}
      className="absolute top-16 right-3 md:top-4 md:right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-auto font-sans"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-gray-50 transition-all ${
          isOpen ? "ring-2 ring-orange-500/50 text-orange-600" : ""
        }`}
        title="Ganti Layer Peta"
      >
        <Layers size={20} className="md:w-6 md:h-6" />
      </button>

      {isOpen && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-48 animate-in fade-in slide-in-from-top-2">
          {/* Base Layers */}
          <div className="space-y-1 mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">
              Tipe Peta
            </p>
            {baseLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveBase(layer.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-between ${
                  activeBase === layer.id
                    ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {layer.name}
                {activeBase === layer.id && (
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>
            ))}
          </div>

          {/* Overlays */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider mt-1">
              Overlay
            </p>
            <button
              onClick={() => setShowFaults(!showFaults)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-between ${
                showFaults
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Sesar Aktif
              {showFaults && (
                <div className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- FLOATING SEARCH ---
// --- FLOATING SEARCH (FIXED RESPONSIVE) ---
function FloatingSearch() {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

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
        // Panggil API Route internal
        const res = await fetch(
          `/api/search-location?q=${encodeURIComponent(query)}`,
          { signal }
        );

        if (!res.ok) throw new Error("API Error");

        const data = await res.json();

        if (!signal.aborted) {
          setSuggestions(data || []);
          setShowSuggestions(true);
        }
      } catch (e: any) {
        // ignore abort
      } finally {
        if (!signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchLocation();
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectLocation = (lat: string, lon: string, name: string) => {
    map.flyTo([parseFloat(lat), parseFloat(lon)], 16, {
      animate: true,
      duration: 1.5,
    });
    setQuery(name);
    setShowSuggestions(false);
  };

  const handleLocateMe = () => {
    setIsSearching(true);
    map
      .locate({ setView: true, maxZoom: 16 })
      .on("locationfound", () => setIsSearching(false))
      .on("locationerror", (e) => {
        setIsSearching(false);
        alert("Gagal mendeteksi lokasi: " + e.message);
      });
  };

  return (
    <div
      ref={wrapperRef}
      className={`
        absolute z-[1000] flex flex-col gap-2 pointer-events-auto font-sans
        transition-all duration-300 ease-in-out
        
        /* MOBILE VIEW (Default) */
        top-3 left-3 right-3
        
        /* DESKTOP VIEW (md ke atas) */
        md:top-4 md:left-4 md:right-auto md:w-80 lg:w-96
      `}
    >
      <div className="flex items-center bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden h-11 md:h-12 focus-within:ring-2 focus-within:ring-orange-500/50">
        {/* Icon Search */}
        <div className="pl-3 md:pl-4 text-gray-400">
          <Search size={18} className="md:w-5 md:h-5" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Cari lokasi..."
          className="flex-1 px-3 py-2 outline-none text-gray-700 text-sm h-full bg-transparent placeholder:text-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
        />

        {/* Loading Spinner */}
        {isSearching && (
          <div className="pr-2 animate-spin text-orange-500">
            <Loader2 size={16} />
          </div>
        )}

        {/* Divider */}
        <div className="border-l h-6 border-gray-200 mx-1"></div>

        {/* Button Locate Me */}
        <button
          onClick={handleLocateMe}
          className="px-3 md:px-4 h-full hover:bg-gray-50 text-orange-600 transition-colors flex items-center justify-center active:bg-orange-50"
          title="Lokasi Saya"
        >
          <Crosshair size={20} className="md:w-5 md:h-5" />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mt-1 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          {suggestions.map((item) => (
            <button
              key={item.place_id}
              onClick={() =>
                handleSelectLocation(item.lat, item.lon, item.display_name)
              }
              className="flex items-start gap-3 p-3 md:p-3.5 hover:bg-gray-50 text-left border-b last:border-b-0 border-gray-50 w-full transition-colors active:bg-gray-100"
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700 line-clamp-2 leading-snug">
                {item.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function HistoryMap({
  detections,
}: {
  detections: Detection[];
}) {
  const safeDetections = Array.isArray(detections) ? detections : [];
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // STATE BARU UNTUK LAYER CONTROL MANUAL
  const [activeBase, setActiveBase] = useState("osm");
  const [showFaults, setShowFaults] = useState(true);

  useEffect(() => {
    fetch("/data/patahan_aktif.geojson")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Gagal load GeoJSON", err));
  }, []);

  // --- LOGIC BARU: POPUP INTERAKTIF SESAR ---
  const onEachFaultFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties || {};
    const name = props.namobj || props.NAMOBJ || "Sesar Tanpa Nama";
    const status = props.klspthn || props.REMARK || "-";
    const lokasi = props.lokasi || "-";
    const gempa = props.sjrhgempa || "-";

    const popupContent = `
      <div class="font-sans text-sm min-w-[220px]">
        <h3 class="font-bold text-orange-700 mb-2 border-b border-orange-200 pb-1 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
           ${name}
        </h3>
        <div class="space-y-1.5">
           <div class="grid grid-cols-3 gap-1">
             <span class="text-xs text-gray-500 font-medium">Status:</span>
             <span class="text-xs text-gray-900 font-bold col-span-2">${status}</span>
           </div>
           <div class="grid grid-cols-3 gap-1">
             <span class="text-xs text-gray-500 font-medium">Lokasi:</span>
             <span class="text-xs text-gray-800 col-span-2">${lokasi}</span>
           </div>
           <div class="grid grid-cols-3 gap-1">
             <span class="text-xs text-gray-500 font-medium">Gempa:</span>
             <span class="text-xs text-gray-800 col-span-2 italic">${gempa}</span>
           </div>
        </div>
      </div>
    `;

    layer.bindPopup(popupContent, {
      className: "fault-popup",
      closeButton: false,
    });

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ weight: 6, color: "#b91c1c", opacity: 1 });
      },
      mouseout: (e: any) => {
        const l = e.target;

        if (geoJsonData) {
          l.setStyle({
            weight: 3,
            color: "#ef4444",
            opacity: 0.7,
            dashArray: "5, 5",
          });
        }
      },
    });
  };

  return (
    <div className="h-full w-full relative z-0">
      {/* CUSTOM FLOATING CONTROLS (DI LUAR MAP CONTAINER BIAR RAPI) */}
      <FloatingLayerControl
        activeBase={activeBase}
        setActiveBase={setActiveBase}
        showFaults={showFaults}
        setShowFaults={setShowFaults}
      />

      <MapContainer
        center={[-2.5, 118]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* MANUAL TILE LAYER SWITCHING */}
        {activeBase === "osm" && (
          <TileLayer
            attribution="&copy; OSM"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {activeBase === "satelit" && (
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        {activeBase === "topo" && (
          <TileLayer
            attribution="&copy; OpenTopoMap"
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* MANUAL OVERLAY TOGGLE */}
        {showFaults && geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={{
              color: "#ef4444",
              weight: 3,
              opacity: 0.7,
              dashArray: "5, 5",
            }}
            onEachFeature={onEachFaultFeature}
          />
        )}

        {/* LEGENDA - Update posisi & style untuk mobile */}
        <div className="absolute bottom-6 md:bottom-8 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl border border-gray-200 max-w-[160px] md:max-w-[200px] transition-all hover:scale-105 origin-bottom-left">
          <h1 className="text-[10px] md:text-xs font-extrabold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 border-b pb-1 md:pb-2 flex items-center gap-2">
            <Info size={12} className="text-orange-500 md:w-3.5 md:h-3.5" />{" "}
            Legenda
          </h1>
          <div className="flex flex-col gap-2 text-[10px] md:text-xs text-gray-700 font-medium">
            <span className="flex items-center gap-2 md:gap-3">
              <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#10b981] shadow-sm ring-1 ring-green-600"></span>
              Terverifikasi
            </span>
            <span className="flex items-center gap-2 md:gap-3">
              <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ef4444] shadow-sm ring-1 ring-red-600"></span>
              Pending
            </span>
            <hr className="border-gray-200" />
            <div className="flex flex-col gap-1">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">
                Struktur
              </span>
              <span className="flex items-center gap-2 md:gap-3">
                <span className="w-6 md:w-8 h-1 bg-red-500 opacity-80 rounded-full border border-red-300 border-dashed"></span>
                Sesar Aktif
              </span>
            </div>
          </div>
        </div>

        <FloatingSearch />

        {safeDetections.map((item) => {
          if (!item.latitude || !item.longitude) return null;
          const isVerified = item.is_validated === true;

          let detailInfo: any = {};
          try {
            if (item.description) detailInfo = JSON.parse(item.description);
          } catch (e) {
            /* ignore */
          }

          const rawDistance = detailInfo.fault_distance;
          const distanceText = rawDistance
            ? `${Number(rawDistance).toFixed(2)} km`
            : "N/A";
          const aiAnalysis =
            detailInfo.visual_statement ||
            detailInfo.visual_description ||
            item.description ||
            "Analisis sedang diproses...";
          const displayImage =
            item.overlay_image_url || item.original_image_url;

          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={isVerified ? Icons.verified : Icons.unverified}
            >
              <Popup
                className="custom-popup-clean"
                minWidth={300}
                maxWidth={320}
              >
                <div className="flex flex-col font-sans max-h-[60vh] overflow-y-auto pr-1">
                  <div className="flex justify-between items-start mb-3 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">
                        {item.fault_type || "Pola Tidak Diketahui"}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                        ID: #{item.id}
                      </p>
                    </div>
                    {isVerified ? (
                      <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-md font-bold border border-green-200 shadow-sm">
                        <CheckCircle2 size={12} /> VALID
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-bold border border-orange-200 shadow-sm">
                        <AlertTriangle size={12} /> PENDING
                      </span>
                    )}
                  </div>

                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-3">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt="Bukti"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                        <Activity size={12} /> Analisis AI
                      </span>
                      <span className="text-[10px] font-mono text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                        {distanceText} ke Sesar
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {aiAnalysis}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 border-t border-gray-100 pt-2 mt-auto">
                    <div>
                      <span className="block font-bold text-gray-400">
                        STATUS LEVEL
                      </span>
                      <span
                        className={`font-bold ${
                          item.status_level?.includes("BAHAYA")
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {item.status_level || "UNKNOWN"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-gray-400">
                        TANGGAL
                      </span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
