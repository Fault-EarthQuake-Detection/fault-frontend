'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  ScanLine, 
  Map, 
  ShieldCheck, 
  Database, 
  Activity 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image 
              src="/asset/logo_geovalid.png" 
              alt="Logo" 
              width={40} 
              height={40}
              className="object-contain" 
            />
            <span className="text-xl font-extrabold tracking-tight text-gray-900 hidden sm:block">
              GEO<span className="text-orange-600">VALID</span>
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition"
            >
              Masuk
            </Link>
            <Link 
              href="/auth/login" 
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600 hover:shadow-orange-200 transition-all duration-300"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
              Teknologi AI & Geospasial
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1]">
              Validasi Geologi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                Dalam Genggaman.
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Gabungkan kecerdasan buatan dan data resmi ESDM untuk mendeteksi retakan batuan dan memvalidasi jalur sesar aktif secara akurat dan <i>real-time</i>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/auth/login" 
                className="flex items-center justify-center gap-2 rounded-full bg-orange-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-orange-200 hover:bg-orange-700 hover:scale-105 transition-all duration-300"
              >
                Mulai Deteksi <ArrowRight className="h-5 w-5" />
              </Link>
              <a 
                href="#fitur" 
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>

          {/* Hero Visual / Illustration */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Abstract Background Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-200 rounded-full blur-[100px] opacity-30"></div>
            
            {/* Mockup / Image Placeholder */}
            <div className="relative z-10 w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
               {/* Simulasi UI Card */}
               <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-48 bg-gray-200 relative">
                    <Image 
                      src="/asset/geovalid_logo.png" // Pastikan gambar ini ada atau ganti dengan screenshot app
                      alt="App Preview"
                      fill
                      className="object-cover opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine className="h-12 w-12 text-white/80" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                        <Activity className="h-4 w-4" /> Deteksi Sesar Aktif
                    </div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. FEATURES SECTION --- */}
      <section id="fitur" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kenapa Memilih GeoValid?</h2>
            <p className="text-gray-600">
              Kami menghadirkan solusi modern untuk masalah geologi yang kompleks, dikemas dalam antarmuka yang mudah digunakan oleh siapa saja.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <ScanLine className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Detection</h3>
              <p className="text-gray-600 leading-relaxed">
                Analisis citra batuan dan struktur tebing secara instan menggunakan teknologi Computer Vision mutakhir untuk mengidentifikasi pola retakan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <Database className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Resmi ESDM</h3>
              <p className="text-gray-600 leading-relaxed">
                Validasi temuan lapangan Anda dengan peta jalur sesar resmi yang terintegrasi langsung dari basis data Kementerian ESDM.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mitigasi Bencana</h3>
              <p className="text-gray-600 leading-relaxed">
                Dapatkan informasi dini mengenai potensi bahaya di lokasi Anda untuk langkah pencegahan dan mitigasi yang lebih baik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. HOW IT WORKS (Simple Steps) --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Cara Kerja Sederhana. <br/>Hasil Akurat.</h2>
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">1</div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Ambil Foto</h4>
                                <p className="text-gray-600">Unggah foto tebing atau batuan yang dicurigai sebagai jalur sesar.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">2</div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Analisis AI & Lokasi</h4>
                                <p className="text-gray-600">Sistem kami memindai visual dan mencocokkan koordinat GPS dengan peta geologi.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">3</div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Dapatkan Hasil</h4>
                                <p className="text-gray-600">Terima laporan validasi instan: Aman, Waspada, atau Bahaya.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Decoration Map */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-transparent rounded-3xl -rotate-3"></div>
                    <div className="relative bg-gray-900 rounded-3xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-gray-400 text-xs">GeoValid System</div>
                        </div>
                        <div className="bg-gray-800 rounded-xl h-64 flex items-center justify-center border border-gray-700">
                            <Map className="h-16 w-16 text-gray-600" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="h-2 w-full bg-gray-700 rounded-full"></div>
                            <div className="h-2 w-2/3 bg-gray-700 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- 5. CTA (Call to Action) --- */}
      <section className="py-24 bg-gray-900 text-white text-center px-6">
        <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Siap Menjelajahi Geologi?</h2>
            <p className="text-gray-400 text-lg">
                Bergabunglah dengan komunitas GeoValid dan berkontribusi dalam pemetaan serta mitigasi bencana geologi di Indonesia.
            </p>
            <Link 
                href="/auth/login"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-orange-900/50 transition-all duration-300 hover:-translate-y-1"
            >
                Daftar Sekarang — Gratis
            </Link>
        </div>
      </section>

      {/* --- 6. FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-80">
                <Image src="/asset/logo_geovalid.png" alt="Logo" width={24} height={24} />
                <span className="font-bold text-gray-900">GEOVALID</span>
            </div>
            <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} GeoValid Team. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-medium text-gray-600">
                <a href="#" className="hover:text-orange-600">Privacy</a>
                <a href="#" className="hover:text-orange-600">Terms</a>
                <a href="#" className="hover:text-orange-600">Contact</a>
            </div>
        </div>
      </footer>

    </div>
  );
}