"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function GlobalLoading({ 
  isLoading = true 
}: { 
  isLoading?: boolean 
}) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Gunakan setTimeout biasa, hindari performance.now() untuk sementara di dev mode Next 16
    const MINIMUM_TIME = 2500; 
    let isMounted = true;

    const timer = setTimeout(() => {
      if (!isMounted) return;
      
      // Jika parent sudah selesai loading (atau default behavior)
      if (!isLoading) {
         finishLoading();
      }
    }, MINIMUM_TIME);

    // Animasi Progress Bar
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 90) return old;
        return old + Math.random() * 15;
      });
    }, 300);

    const finishLoading = () => {
      setProgress(100);
      setTimeout(() => {
        if(!isMounted) return;
        setIsFadingOut(true);
        setTimeout(() => {
            if(!isMounted) return;
            setShouldRender(false);
        }, 500);
      }, 300);
    };

    // Watcher: Jika isLoading prop berubah jadi false dari parent lebih cepat dari timer
    if (!isLoading && progress > 50) { 
        // Opsional: Langsung selesaikan jika sudah setengah jalan
        // Tapi kita biarkan timer MINIMUM_TIME menang agar tidak kedip
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* LOGO */}
        <div className="relative mb-8 h-24 w-24">
            <Image 
                src="/asset/logo_geovalid.png" 
                alt="Loading" 
                fill
                className="object-contain animate-pulse"
                priority
            />
        </div>

        {/* TYPOGRAPHY */}
        <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-widest text-gray-900 uppercase">
                Geo<span className="text-orange-600">Valid</span>
            </h1>
            <p className="text-xs font-mono text-gray-400 tracking-wider">INITIALIZING SYSTEM</p>
        </div>

        {/* BAR */}
        <div className="mt-8 w-64 h-[2px] bg-gray-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-orange-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>
    </div>
  );
}