"use client";

import { useEffect, useState } from "react";
// Hapus import Image dari next/image untuk menghindari bug performance stamp
// import Image from "next/image"; 

export default function GlobalLoading({ 
  isLoading = true 
}: { 
  isLoading?: boolean 
}) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const MINIMUM_TIME = 2000; // Durasi minimal tampil (ms)

    // 1. Timer untuk memastikan loading tampil minimal 2 detik
    const timer = setTimeout(() => {
      if (!isMounted) return;
      
      // Jika dari parent sudah selesai loading (atau jika komponen ini dipakai di loading.tsx otomatis)
      // Kita jalankan animasi selesai
      if (!isLoading) {
         finishLoading();
      }
    }, MINIMUM_TIME);

    // 2. Animasi Progress Bar (Jalan terus sampai 90%)
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 90) return old;
        return old + Math.random() * 15;
      });
    }, 300);

    // Fungsi untuk mengakhiri loading dengan mulus
    const finishLoading = () => {
      if (!isMounted) return;
      setProgress(100);
      
      // Tunggu progress bar penuh, lalu fade out
      setTimeout(() => {
        if(!isMounted) return;
        setIsFadingOut(true);
        
        // Hapus dari DOM setelah animasi fade out selesai
        setTimeout(() => {
            if(!isMounted) return;
            setShouldRender(false);
        }, 500); // Sesuai durasi transition-opacity
      }, 200);
    };

    // Watcher: Jika props isLoading berubah jadi false sebelum timer selesai,
    // kita biarkan timer yang nanti akan memanggil finishLoading() agar tidak terlalu cepat hilang.
    // Namun, jika timer sudah lewat dan props berubah, kita bisa tambahkan logika force finish disini jika perlu.
    // Untuk saat ini, logika timer di atas sudah cukup aman menangani kedua kasus.

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
            {/* SOLUSI EROR: Gunakan tag <img> biasa, bukan <Image /> */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src="/asset/logo_geovalid.png" 
                alt="Loading" 
                className="object-contain animate-pulse w-full h-full"
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