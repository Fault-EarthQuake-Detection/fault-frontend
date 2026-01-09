// src/utils/impactAnalysis.ts

export type InfrastructureType = 'school' | 'hospital' | 'residential' | 'government';

export interface ImpactItem {
  id: number;
  name: string;
  type: InfrastructureType;
  distance: number; // dalam meter
  lat: number;
  lon: number;
}

// Rumus Haversine untuk hitung jarak akurat (Meter)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius bumi dalam meter
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// --- PERBAIKAN: DAFTAR SERVER ALTERNATIF ---
// Jika server utama down/lambat, kita coba server lain
const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",       // Server Utama (Jerman)
  "https://overpass.kumi.systems/api/interpreter", // Mirror (Eropa - Sering lebih cepat)
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter" // Mirror (Rusia)
];

// Fungsi Utama: Cari Infrastruktur via OpenStreetMap (Overpass API)
export async function analyzeImpact(lat: number, lng: number, radiusMeters: number = 1000): Promise<ImpactItem[]> {
  // Query Overpass QL: Cari Sekolah, RS, Kantor Pemerintahan
  // Timeout diset 10 detik agar tidak menunggu terlalu lama
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="school"](around:${radiusMeters},${lat},${lng});
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["office"="government"](around:${radiusMeters},${lat},${lng});
    );
    out body 15;
  `;

  // Loop mencoba server satu per satu
  for (const server of OVERPASS_SERVERS) {
    try {
      console.log(`Mencoba fetch infrastruktur dari: ${server}`);
      
      // Gunakan AbortController untuk timeout dari sisi client (5 detik max per server)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(server, {
        method: 'POST',
        body: query,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // --- PERBAIKAN: Cek Response OK ---
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      // --- PERBAIKAN: Safe Parsing JSON ---
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        const elements = data.elements || [];

        // Mapping hasil mentah
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const impacts: ImpactItem[] = elements.map((el: any) => {
          let type: InfrastructureType = 'government';
          if (el.tags.amenity === 'school') type = 'school';
          else if (el.tags.amenity === 'hospital' || el.tags.amenity === 'clinic') type = 'hospital';
          
          return {
            id: el.id,
            name: el.tags.name || "Fasilitas Umum",
            type: type,
            lat: el.lat,
            lon: el.lon,
            distance: getDistanceFromLatLonInM(lat, lng, el.lat, el.lon)
          };
        });

        // Jika berhasil, langsung kembalikan data (sorted)
        return impacts.sort((a, b) => a.distance - b.distance).slice(0, 10);

      } catch (parseError) {
        // Jika response bukan JSON (misal HTML error 504), lanjut ke server berikutnya
        console.warn(`Gagal parse JSON dari ${server}, mencoba server lain...`);
        continue; 
      }

    } catch (error) {
      console.warn(`Gagal fetch dari ${server}:`, error);
      // Lanjut ke iterasi server berikutnya...
    }
  }

  // Jika semua server gagal, kembalikan array kosong (JANGAN CRASH)
  console.error("Semua server Overpass sibuk/down. Mengembalikan list kosong.");
  return [];
}