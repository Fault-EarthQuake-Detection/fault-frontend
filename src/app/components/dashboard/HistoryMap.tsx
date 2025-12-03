'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Search, Crosshair } from 'lucide-react';

// --- SETUP ICON ---
const createCustomIcon = (color: string) => {
  const svgIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>`;
  return L.divIcon({ className: 'custom-icon', html: svgIcon, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] });
};

const Icons = {
  red: createCustomIcon('#ef4444'),
  yellow: createCustomIcon('#eab308'),
  green: createCustomIcon('#22c55e'),
};

type Detection = {
  id: number;
  latitude: number;
  longitude: number;
  original_image_url: string;
  status_level: string;
  fault_type?: string;
  created_at: string;
};

type HistoryMapProps = {
  detections?: Detection[] | null;
};

// --- KOMPONEN KONTROL (SEARCH & GPS) ---
function MapControls() {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);

    const coordPattern = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = query.match(coordPattern);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);
      map.flyTo([lat, lng], 13, { animate: true });
      setLoading(false);
    } else {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          map.flyTo([parseFloat(lat), parseFloat(lon)], 13, { animate: true });
        } else {
          alert("Lokasi tidak ditemukan");
        }
      } catch (err) {
        alert("Gagal mencari lokasi");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLocateMe = () => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 15, { animate: true });
    }).on("locationerror", function (e) {
      alert(e.message);
    });
  };

  // --- PERUBAHAN POSISI: leaflet-top leaflet-left ---
  // Pindah ke Kiri Atas agar Kanan Atas eksklusif untuk Layer Control
  return (
    <div className="leaflet-top leaflet-left" style={{ pointerEvents: 'auto', marginTop: '10px', marginLeft: '10px' }}>
      <div className="leaflet-control flex flex-col gap-2 items-start">
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden w-64">
          <input 
            type="text" 
            placeholder="Cari lokasi / lat,long..." 
            className="flex-1 px-3 py-2 text-sm outline-none text-gray-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
            {loading ? <span className="animate-spin text-xs">⌛</span> : <Search className="h-4 w-4" />}
          </button>
        </form>

        {/* Tombol GPS */}
        <button 
          onClick={handleLocateMe}
          className="bg-white p-2 rounded-lg shadow-md border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center justify-center w-10 h-10"
          title="Lokasi Saya"
        >
          <Crosshair className="h-6 w-6" />
        </button>

      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA ---
export default function HistoryMap({ detections }: HistoryMapProps) {
  const safeDetections = Array.isArray(detections) ? detections : [];
  const defaultCenter = { lat: -2.5489, lng: 118.0149 }; 
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/patahan_aktif.geojson')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachFaultFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const { namobj, klspthn, remark } = feature.properties;
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-lg mb-1 text-gray-800">${namobj || 'Sesar Tanpa Nama'}</h3>
          <p class="text-sm"><span class="font-semibold">Status:</span> 
             <span class="${(klspthn || '').toLowerCase().includes('aktif') ? 'text-red-600 font-bold' : 'text-gray-700'}">
               ${klspthn || '-'}
             </span>
          </p>
          ${remark ? `<p class="mt-2 text-xs text-gray-500 italic">${remark}</p>` : ''}
        </div>
      `;
      layer.bindPopup(popupContent, { closeButton: false, autoPan: false });
      layer.on({
        mouseover: (e) => { e.target.setStyle({ weight: 5, color: '#ef4444', opacity: 1 }); e.target.openPopup(); },
        mouseout: (e) => { e.target.setStyle({ weight: 3, color: '#ef4444', opacity: 0.6 }); e.target.closePopup(); }
      });
    }
  };

  const geoJsonStyle = { color: '#ef4444', weight: 3, opacity: 0.6 };

  return (
    <div className="h-full w-full z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Layer Controls (Posisi: Kanan Atas) */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Peta Jalan (OSM)">
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Citra Satelit (Esri)">
            <TileLayer attribution='Tiles &copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topografi & Geologi">
            <TileLayer attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap' url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Jalur Patahan Aktif">
             {geoJsonData && <GeoJSON data={geoJsonData} style={geoJsonStyle} onEachFeature={onEachFaultFeature} />}
          </LayersControl.Overlay>
        </LayersControl>

        {/* Kontrol Kustom (Posisi: Kiri Atas - Diatur di dalam komponennya) */}
        <MapControls />

        {/* Marker Riwayat */}
        {safeDetections.map((item) => {
          let icon = Icons.green;
          const status = (item.status_level || "").toUpperCase();
          if (status.includes("BAHAYA") || status.includes("TINGGI")) icon = Icons.red;
          else if (status.includes("PERINGATAN") || status.includes("WASPADA")) icon = Icons.yellow;

          if (!item.latitude || !item.longitude) return null;

          // ... (kode Marker)
          return (
            <Marker key={item.id} position={{ lat: item.latitude, lng: item.longitude }} icon={icon}>
              <Popup className="min-w-[220px]">
                <div className="flex flex-col gap-3">
                  
                  {/* Gambar Bukti */}
                  <div className="relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {item.original_image_url ? (
                      <Image src={item.original_image_url} alt="Bukti Lapangan" fill className="object-cover" />
                    ) : <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>}
                  </div>

                  {/* Detail Informasi */}
                  <div className="space-y-1.5">
                    {/* Pola / Fault Type */}
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Pola Retakan</p>
                      <p className="text-sm font-bold text-gray-900">{item.fault_type || "Tidak Teridentifikasi"}</p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Status Analisis</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5
                        ${status.includes("BAHAYA") ? 'bg-red-100 text-red-700 border border-red-200' : 
                          status.includes("WASPADA") ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                          'bg-green-100 text-green-700 border border-green-200'}`}>
                        {item.status_level || "AMAN"}
                      </span>
                    </div>

                    {/* Waktu */}
                    <div className="pt-2 border-t mt-1">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        🕒 {new Date(item.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
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