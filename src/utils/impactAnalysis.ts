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

// Fungsi Utama: Cari Infrastruktur via OpenStreetMap (Overpass API)
export async function analyzeImpact(lat: number, lng: number, radiusMeters: number = 1000): Promise<ImpactItem[]> {
  // Query Overpass QL: Cari Sekolah, RS, Kantor Pemerintahan dalam radius X meter
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="school"](around:${radiusMeters},${lat},${lng});
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["office"="government"](around:${radiusMeters},${lat},${lng});
    );
    out body 15;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    const data = await response.json();
    const elements = data.elements || [];

    // Mapping hasil mentah ke format aplikasi kita
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const impacts: ImpactItem[] = elements.map((el: any) => {
      let type: InfrastructureType = 'government';
      if (el.tags.amenity === 'school') type = 'school';
      else if (el.tags.amenity === 'hospital' || el.tags.amenity === 'clinic') type = 'hospital';
      
      return {
        id: el.id,
        name: el.tags.name || "Fasilitas Umum (Tanpa Nama)",
        type: type,
        lat: el.lat,
        lon: el.lon,
        distance: getDistanceFromLatLonInM(lat, lng, el.lat, el.lon)
      };
    });

    // Urutkan dari yang terdekat
    return impacts.sort((a, b) => a.distance - b.distance).slice(0, 10); // Ambil 10 terdekat
    
  } catch (error) {
    console.error("Gagal fetch OpenStreetMap:", error);
    return [];
  }
}