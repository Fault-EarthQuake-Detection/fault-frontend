'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from "@/utils/supabase/client";

// --- TYPE DEFINITION ---
export type Detection = {
  id: number;
  latitude: number;
  longitude: number;
  original_image_url: string;
  overlay_image_url?: string;
  mask_image_url?: string;
  status_level: string;
  fault_type?: string;
  description?: string; // JSON String yang berisi data lengkap
  created_at: string;
  is_validated?: boolean;
};

// --- LOADING COMPONENT (Style GeoValid) ---
// Diadaptasi dari GlobalLanding.tsx agar pas di container peta (absolute)
const MapLoadingGeoValid = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animasi fake progress bar biar berasa 'hidup'
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 90) return old;
        return old + Math.random() * 15;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* LOGO (Sesuai file lu) */}
        <div className="relative mb-6 h-20 w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src="/asset/logo_geovalid.png" 
                alt="Loading" 
                className="object-contain animate-pulse w-full h-full"
            />
        </div>

        {/* TYPOGRAPHY */}
        <div className="space-y-1 text-center">
            <h1 className="text-xl font-bold tracking-widest text-gray-900 uppercase">
                Geo<span className="text-orange-600">Valid</span>
            </h1>
            <p className="text-[10px] font-mono text-gray-400 tracking-wider">LOAD MAP DATA...</p>
        </div>

        {/* BAR */}
        <div className="mt-6 w-48 h-[2px] bg-gray-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-orange-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>
    </div>
  );
};

// Import Map (Dynamic)
const HistoryMap = dynamic(() => import('./HistoryMap'), {
  ssr: false,
  loading: () => <MapLoadingGeoValid />, // Pakai Loading GeoValid
});

export default function HistoryMapWrapper() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  const mapKey = useMemo(() => Math.random().toString(36).substring(7), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('detection_reports')
          .select(`
            id, latitude, longitude, 
            original_image_url, overlay_image_url, mask_image_url,
            status_level, fault_type, description, 
            created_at, is_validated
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setDetections(data as unknown as Detection[]);
        }
      } catch (err) {
        console.error("Error fetch map data:", err);
      } finally {
        // Delay dikit biar loadingnya gak kedip doang (UX)
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchData();

    // Realtime Subs
    const channel = supabase
      .channel('realtime-map')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'detection_reports' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // Render Loading kalau data belum siap
  if (loading) return <MapLoadingGeoValid />;

  return (
    <div className="h-full w-full animate-in fade-in duration-500 relative">
       <HistoryMap key={mapKey} detections={detections} />
    </div>
  );
} 