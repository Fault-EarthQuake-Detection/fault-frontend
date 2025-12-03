'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react'; // 1. Import ikon panah

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Data Slide sesuai gambar yang Anda berikan
  const slides = [
    {
      id: 0,
      title: 'GeoValid',
      description: 'Aplikasi Edukasi Geologi Interaktif & Validasi Jalur Sesar' ,
      hasButton: false, // Slide 1 ada tombol Daftar
    },
    {
      id: 1,
      title: 'GeoValid',
      description: 'Membantu pengguna untuk mengetahui apakah lokasi yang mereka amati benar berada di jalur sesar resmi berdasarkan data dari Kementerian ESDM.',
      hasButton: false,
    },
    {
      id: 2,
      title: 'GeoValid',
      description: 'Memberikan alat bantu deteksi sesar otomatis berbasis citra batuan dan lokasi GPS.',
      hasButton: true,
    },
  ];

  // Auto-slide setiap 5 detik
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [slides.length]);

  // 2. Fungsi Navigasi Manual
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-800">
      {/* --- HEADER --- */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white p-4 shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <Image
            src="/logo_geovalid.png"
            alt="GeoValid Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold tracking-wide uppercase">
            GEOVALID
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded border border-gray-300 px-4 py-1.5 text-sm font-semibold text-black hover:bg-gray-50 transition"
          >
            Login
          </Link>
          <Link href="/auth/login">
            <UserIcon className="h-8 w-8 text-black" />
          </Link>
        </div>
      </header>

      {/* --- MAIN CONTENT (SLIDER) --- */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center relative">
        
        {/* 3. Tombol Previous (Kiri) */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-3 text-gray-600 shadow-md hover:bg-gray-200 transition md:left-8 z-10"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* 4. Tombol Next (Kanan) */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-3 text-gray-600 shadow-md hover:bg-gray-200 transition md:right-8 z-10"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Logo Besar di Tengah */}
        <div className="mb-6 relative">
           <Image
            src="/logo_geovalid.png"
            alt="GeoValid Big Logo"
            width={180}
            height={180}
            priority
            className="drop-shadow-sm"
          />
        </div>

        {/* Text Content Slider */}
        <div className="max-w-xl transition-all duration-500 ease-in-out px-8 md:px-0">
          <h1 className="mb-4 text-4xl font-bold text-[#5c4033] animate-fade-in">
            {slides[currentSlide].title}
          </h1>
          <p className="mb-8 text-lg font-medium leading-relaxed text-gray-700 min-h-[80px] min">
            {slides[currentSlide].description}
          </p>

          {/* Tombol Khusus Slide 1 */}
          {slides[currentSlide].hasButton && (
            <Link
              href="/auth/login"
              className="inline-block rounded border border-gray-400 bg-white px-8 py-2 text-sm font-bold text-black shadow-sm hover:bg-gray-50 transition"
            >
              Login
            </Link>
          )}
        </div>
      </main>

      {/* --- FOOTER / PAGINATION DOTS --- */}
      <div className="mb-12 flex justify-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-orange-700 scale-110' : 'bg-black'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}