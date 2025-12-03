'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// --- KONFIGURASI ICON LEAFLET (Agar gambar marker muncul) ---
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapPickerProps = {
  position: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
};

// --- KOMPONEN ANAK: UNTUK MENGUPDATE POSISI PETA ---
// Komponen ini dipisah agar bisa menggunakan hook 'useMap()'
function MapUpdater({ position, onLocationSelect }: MapPickerProps) {
  const map = useMap();

  // Event Listener: Saat peta diklik
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  // Efek: Saat 'position' berubah (misal dari GPS), geser peta ke sana
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { // Zoom level 15 agar lebih dekat
        animate: true,
        duration: 1.5
      }); 
    }
  }, [position, map]);

  return position ? <Marker position={position} icon={icon} /> : null;
}

// --- KOMPONEN UTAMA ---
export default function MapPicker({ position, onLocationSelect }: MapPickerProps) {
  // Default center: Monas, Jakarta (Hanya dipakai saat inisialisasi pertama)
  const [defaultCenter] = useState({ lat: -6.175392, lng: 106.827153 });

  return (
    // Tambahkan style isolation agar tidak konflik dengan layout parent
    <div className="h-64 w-full overflow-hidden rounded-lg border border-gray-300 relative z-0">
      <MapContainer
        // KUNCI PERBAIKAN: 
        // 1. 'center' kita set statis ke defaultCenter. Jangan masukkan 'position' di sini.
        //    Jika 'center' berubah-ubah di prop ini, MapContainer akan memaksa re-render & error.
        // 2. Kita gunakan komponen anak <MapUpdater /> untuk menangani perpindahan dinamis.
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Komponen anak inilah yang bertugas memindahkan peta & menampilkan marker */}
        <MapUpdater position={position} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}