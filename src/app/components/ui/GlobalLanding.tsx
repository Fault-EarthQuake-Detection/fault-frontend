"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function GlobalLoading({ 
  isLoading = true // Prop opsional untuk mengontrol dari parent
}: { 
  isLoading?: boolean 
}) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const MINIMUM_DISPLAY_TIME = 3000; // 3 Detik

    // 1. Animasi Progress Bar Palsu (untuk estetika)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Mentok di 90% sampai loading selesai
        return prev + (Math.random() * 10); // Random increment
      });
    }, 200);

    // 2. Logika Selesai
    const checkCompletion = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_DISPLAY_TIME - elapsedTime);

      setTimeout(() => {
        // Jika parent bilang loading selesai (atau tidak ada prop isLoading/default true)
        // Kita set progress ke 100% dan mulai fade out
        setProgress(100);
        
        setTimeout(() => {
            setIsFadingOut(true); // Trigger animasi keluar
            
            setTimeout(() => {
                setShouldRender(false); // Hapus dari DOM
                clearInterval(progressInterval);
            }, 700); // Waktu transisi fade out css
        }, 500); // Tahan sebentar di 100%

      }, remainingTime);
    };

    // Jika isLoading prop berubah jadi false, kita cek apakah durasi minimal sudah terpenuhi
    if (!isLoading) {
      checkCompletion();
    } else {
        // Jika dipakai sebagai halaman loading.tsx (yang unmount otomatis),
        // Timer ini hanya visual internal.
        // Jika dipakai sebagai overlay manual, ini akan menunggu prop isLoading=false
        const timer = setTimeout(() => {
            // Force finish if used standalone without prop control logic usually handled by parent
            // But here we adhere to the visual duration primarily.
        }, MINIMUM_DISPLAY_TIME);
        return () => clearTimeout(timer);
    }

    return () => clearInterval(progressInterval);
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* BACKGROUND GRID PATTERN (Subtle) */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* LOGO CONTAINER */}
        <div className="relative mb-10 group">
            {/* Glow Effect di belakang logo */}
            <div className="absolute -inset-4 bg-orange-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 ease-out transform scale-100">
                <Image 
                    src="/asset/logo_geovalid.png" 
                    alt="GeoValid" 
                    fill
                    className="object-contain drop-shadow-xl"
                    priority
                />
            </div>
        </div>

        {/* TYPOGRAPHY & STATUS */}
        <div className="space-y-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-gray-900 uppercase">
                Geo<span className="text-orange-600">Valid</span>
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-mono text-gray-400 tracking-widest uppercase">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span>System Initialization</span>
            </div>
        </div>

        {/* PROGRESS BAR - SLIM & ELEGANT */}
        <div className="mt-12 w-64 md:w-80 relative">
            {/* Background Line */}
            <div className="w-full h-[2px] bg-gray-100 rounded-full overflow-hidden">
                {/* Active Line */}
                <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-red-600 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            {/* Percentage Text */}
            <div className="mt-2 text-right">
                <span className="text-[10px] font-mono text-gray-400 tabular-nums">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-gray-300 font-light tracking-widest uppercase">
          AI-Powered Fault Detection System
        </p>
      </div>
    </div>
  );
}