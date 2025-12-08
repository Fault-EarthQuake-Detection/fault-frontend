'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Camera, Upload, MapPin, Loader2, Search, 
  ChevronRight, ChevronLeft, Save, RotateCcw,
  CheckCircle, AlertTriangle, Info
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/app/components/dashboard/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-200 animate-pulse rounded-lg" />
});

export default function DetectionView() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data hasil API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [predictData, setPredictData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locationData, setLocationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const AI_API_URL = 'https://fikalalif-fault-detection-api.hf.space'; 
  const DB_API_URL = 'http://localhost:3000/api'; 

  // --- HANDLER FILE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // --- HANDLER LOKASI ---
  const handleGPS = () => {
    setLoading(true);
    setStatusText("Mencari titik GPS...");
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
          setStatusText("");
        },
        (err) => {
          alert("Gagal ambil GPS: " + err.message);
          setLoading(false);
          setStatusText("");
        }
      );
    } else {
      alert("Browser tidak support GPS");
      setLoading(false);
      setStatusText("");
    }
  };

  // --- PERBAIKAN SEARCH LOCATION ---
  const handleSearchLocation = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setStatusText("Mencari lokasi...");
    
    try {
      // 1. Cek apakah input adalah Koordinat (Lat, Long)
      // Regex ini membolehkan pemisah koma (,) atau spasi
      // Contoh: "-7.123, 110.123" atau "-7.123 110.123"
      const coordPattern = /^(-?\d+(\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;
      const match = searchQuery.trim().match(coordPattern);

      if (match) {
        // Jika formatnya koordinat, langsung set (TIDAK PERLU FETCH)
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[3]);
        
        // Validasi range koordinat
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          setCoords({ lat, lng: lon });
          setLoading(false);
          setStatusText("");
          return; // Selesai, keluar fungsi
        }
      }

      // 2. Jika bukan koordinat, cari Nama Daerah ke OpenStreetMap
      // Tambahkan header Accept-Language agar hasil prioritas bahasa Indonesia
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, 
        {
          headers: { 'Accept-Language': 'id' } // Prioritas bahasa Indonesia
        }
      );

      if (!res.ok) throw new Error("Gagal menghubungi layanan peta.");

      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoords({ lat, lng: lon });
      } else {
        alert("Lokasi tidak ditemukan. Coba nama yang lebih spesifik.");
      }

    } catch (err) {
      console.error(err);
      alert("Gagal mencari lokasi. Pastikan koneksi internet lancar.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  // --- RUN ANALYSIS (SESUAI RESPONSE JSON BARU) ---
  const runAnalysis = async () => {
    if (!selectedFile || !coords) return;
    
    setLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      // 1. Siapkan FormData untuk kedua endpoint
      const predictFormData = new FormData();
      predictFormData.append('file', selectedFile);
      
      const locationFormData = new FormData();
      locationFormData.append('latitude', coords.lat.toString());
      locationFormData.append('longitude', coords.lng.toString());

      setStatusText("Menganalisis Visual & Lokasi...");

      // 2. Hit API Paralel
      const [resPredict, resLocation] = await Promise.all([
        fetch(`${AI_API_URL}/predict`, { method: 'POST', body: predictFormData }),
        fetch(`${AI_API_URL}/cek_lokasi`, { method: 'POST', body: locationFormData })
      ]);

      if (!resPredict.ok) throw new Error(`AI Error: ${await resPredict.text()}`);
      if (!resLocation.ok) throw new Error(`Location Error: ${await resLocation.text()}`);

      const dataPredict = await resPredict.json();
      const dataLocation = await resLocation.json();

      // Debugging: Cek isi data di console browser
      console.log("Predict Data:", dataPredict);
      console.log("Location Data:", dataLocation);

      setPredictData(dataPredict);
      setLocationData(dataLocation);
      
      setStep(3); 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  // --- MANUAL SAVE (SESUAI STRUKTUR DB) ---
  // --- MANUAL SAVE (DIPERBAIKI) ---
  // --- MANUAL SAVE (PERBAIKAN FETCH) ---
  // --- MANUAL SAVE (DEBUG VERSION) ---
  const handleSave = async () => {
    if (!predictData || !locationData) return;
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesi habis, silakan login ulang.");

      // 1. Upload Gambar
      let imageUrl = "";
      
      // Cek apakah file ada
      if (!selectedFile) {
        throw new Error("File gambar tidak ditemukan. Silakan ambil foto ulang.");
      }

      console.log("Mulai upload gambar...", selectedFile.name);

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      
      // Upload ke bucket 'detection-images'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('detection-image')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        throw new Error(`Gagal upload gambar: ${uploadError.message}. Cek apakah bucket 'detection-image' sudah Public di Supabase.`);
      }

      // Ambil URL Publik
      const { data: urlData } = supabase.storage.from('detection-image').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
      
      console.log("Upload sukses. URL:", imageUrl);

      // 2. Siapkan Payload
      const payload = {
        latitude: coords!.lat,
        longitude: coords!.lng,
        imageUrl: imageUrl, 
        originalImageUrl: imageUrl,
        // Cek apakah overlay ada
        overlayImageUrl: predictData.images_base64?.overlay || "", 
        detectionResult: predictData.fault_analysis?.deskripsi_singkat || "Tidak Teridentifikasi",
        description: JSON.stringify({
          visual_statement: predictData.statement,
          visual_status: predictData.fault_analysis?.status_level,
          location_status: locationData.status,
          fault_name: locationData.nama_patahan,
          fault_distance: locationData.jarak_km,
          analysis_timestamp: new Date().toISOString()
        })
      };

      console.log("Mengirim payload ke backend...", payload);

      // 3. Kirim ke Backend
      const res = await fetch(`${DB_API_URL}/detections`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Tampilkan pesan error detail dari backend
        const errorMessage = errData.error || `Backend Error: ${res.status} ${res.statusText}`;
        throw new Error(errorMessage);
      }

      setIsSaved(true);
      alert("Data berhasil disimpan ke riwayat!");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Save Error:", err);
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedFile(null);
    setPreview(null);
    setCoords(null);
    setPredictData(null);
    setLocationData(null);
    setSearchQuery('');
    setIsSaved(false);
  };

  // --- RENDER STEPS ---

  // STEP 1: FOTO (Tidak Berubah)
  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">Langkah 1: Ambil Citra Batuan</h2>
        <p className="text-sm text-gray-500">Unggah foto tebing atau batuan yang ingin dianalisis.</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        {!preview ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-orange-300 bg-orange-50 rounded-xl hover:bg-orange-100 transition h-48">
              <Camera className="h-10 w-10 text-orange-600 mb-2" />
              <span className="font-semibold text-orange-700">Ambil Foto (Kamera)</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl hover:bg-gray-100 transition h-48">
              <Upload className="h-10 w-10 text-gray-500 mb-2" />
              <span className="font-semibold text-gray-600">Pilih dari Galeri</span>
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-video w-full relative bg-black rounded-lg overflow-hidden">
               <Image src={preview} alt="Preview" fill className="object-contain" />
            </div>
            <button onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs shadow hover:bg-red-700">Hapus</button>
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
      <div className="flex justify-end">
        <button onClick={() => setStep(2)} disabled={!selectedFile} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition">
          Lanjut ke Lokasi <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // STEP 2: LOKASI (Tidak Berubah)
  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">Langkah 2: Tentukan Lokasi</h2>
        <p className="text-sm text-gray-500">Di mana foto ini diambil? Cari lokasi atau gunakan GPS.</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Cari lokasi..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()} />
          </div>
          <button onClick={handleSearchLocation} className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"><Search className="h-4 w-4" /></button>
          <button onClick={handleGPS} className="bg-orange-600 text-white px-3 rounded-lg flex items-center gap-2 hover:bg-orange-700 whitespace-nowrap text-sm font-medium"><MapPin className="h-4 w-4" /> <span className="hidden sm:inline">GPS Saya</span></button>
        </div>
        <div className="relative">
          <MapPicker position={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
        </div>
        <div className="bg-gray-50 p-3 rounded text-center text-xs text-gray-600">{coords ? `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}` : "Pilih lokasi di peta"}</div>
      </div>
      <div className="flex justify-between">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"><ChevronLeft className="h-4 w-4" /> Kembali</button>
        <button onClick={runAnalysis} disabled={!coords || loading} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition">
          {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /><span>{statusText || "Memproses..."}</span></div> : "Mulai Analisis"}
        </button>
      </div>
    </div>
  );

  // STEP 3: HASIL (FIXED SESUAI JSON LU)
  const renderStep3 = () => {
    // --- LOGIKA STATUS BARU ---
    // Cek string dari respon API
    const imageStatus = predictData?.fault_analysis?.status_level || "";
    const locationStatusStr = locationData?.status || "";

    const isImageDanger = imageStatus.includes("PERINGATAN") || imageStatus.includes("BAHAYA");
    const isLocationDanger = locationStatusStr.includes("ZONA PERINGATAN") || locationStatusStr.includes("BAHAYA");

    const isDanger = isImageDanger && isLocationDanger;
    const isWarning = isImageDanger || isLocationDanger;

    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            Hasil Analisis Terpadu
          </h2>
        </div>

        {/* KESIMPULAN UTAMA */}
        <div className={`p-6 rounded-xl border-l-4 shadow-sm ${isDanger ? 'bg-red-50 border-red-500 text-red-900' : isWarning ? 'bg-orange-50 border-orange-500 text-orange-900' : 'bg-green-50 border-green-500 text-green-900'}`}>
          <div className="flex items-start gap-4">
            {isDanger ? <AlertTriangle className="h-8 w-8 shrink-0" /> : isWarning ? <Info className="h-8 w-8 shrink-0" /> : <CheckCircle className="h-8 w-8 shrink-0" />}
            <div>
              <h3 className="font-bold text-lg uppercase mb-1">
                {isDanger ? "STATUS: BAHAYA TINGGI" : isWarning ? "STATUS: PERINGATAN" : "STATUS: AMAN"}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {isDanger 
                  ? "Indikasi kuat sesar aktif dari visual batuan DAN lokasi geografis."
                  : isWarning 
                    ? "Terdapat potensi bahaya dari salah satu indikator (Visual atau Lokasi). Harap waspada."
                    : "Tidak terdeteksi ancaman sesar signifikan pada visual maupun lokasi."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* HASIL VISUAL */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">Analisis Visual (AI)</div>
            <div className="p-4 space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {/* --- FIX: AMBIL DARI BASE64 --- */}
                {predictData?.images_base64?.overlay ? (
                   // API lu sudah kasih 'data:image/png;base64,...', jadi langsung pake aja
                   <img src={predictData.images_base64.overlay} alt="Overlay Result" className="w-full h-full object-contain" />
                ) : (
                   <div className="flex items-center justify-center h-full text-white text-xs">Visual tidak tersedia</div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className={`p-3 rounded border-l-4 ${isImageDanger ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                  <p className="font-bold text-gray-800">{predictData?.fault_analysis?.deskripsi_singkat || "-"}</p>
                  <p className="text-xs text-gray-600 mt-1">{predictData?.statement}</p>
                </div>
              </div>
            </div>
          </div>

          {/* HASIL LOKASI */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-fit">
            <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">Analisis Geospasial</div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isLocationDanger ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zona Sesar</p>
                  <p className="font-bold text-gray-800">{isLocationDanger ? "Zona Peringatan" : "Zona Aman"}</p>
                </div>
              </div>
              <div className="border-t pt-3 space-y-3 text-sm">
                <p className="italic text-gray-600 bg-gray-50 p-2 rounded">
                  &quot;{locationData?.status}&quot;
                </p>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sesar Terdekat:</span>
                  <span className="font-medium text-right">{locationData?.nama_patahan || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jarak:</span>
                  <span className="font-medium">{locationData?.jarak_km ? `${locationData.jarak_km} km` : "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <button onClick={handleReset} className="flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 px-6 py-3 rounded-xl transition border border-gray-200 w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" /> Deteksi Ulang
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving || isSaved}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition w-full sm:w-auto
              ${isSaved ? 'bg-green-600 hover:bg-green-700 cursor-default' : 'bg-orange-700 hover:bg-orange-800'} 
              disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {saving ? <><Loader2 className="animate-spin h-4 w-4" /> Menyimpan...</> : isSaved ? <><CheckCircle className="h-4 w-4" /> Tersimpan</> : <><Save className="h-4 w-4" /> Simpan ke Riwayat</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6 pb-24 relative z-30">
      <div className="flex items-center justify-center mb-8 gap-2">
        {[1, 2, 3].map((i) => (<div key={i} className={`h-2 w-16 rounded-full transition-all ${step >= i ? 'bg-gray-900' : 'bg-gray-200'}`} />))}
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}