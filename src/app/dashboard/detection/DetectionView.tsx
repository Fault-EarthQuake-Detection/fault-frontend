/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Camera, Upload, MapPin, Loader2, Search,
  ChevronRight, ChevronLeft, Save, RotateCcw,
  CheckCircle, AlertTriangle, Info,
  Building, GraduationCap, Stethoscope, Landmark,
  Layers, Eye, Image as ImageIcon,
  HardHat, Hammer, Activity, Waves, Ruler // Icon tambahan
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import { analyzeImpact, ImpactItem } from "@/utils/impactAnalysis";

const MapPicker = dynamic(
  () => import("@/app/components/dashboard/MapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-gray-200 animate-pulse rounded-lg" />
    ),
  }
);

export default function DetectionView() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Data hasil API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [predictData, setPredictData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locationData, setLocationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // State Fitur Baru
  const [impactList, setImpactList] = useState<ImpactItem[]>([]);
  const [imageViewMode, setImageViewMode] = useState<'original' | 'overlay' | 'mask'>('overlay');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [earthquakeHistory, setEarthquakeHistory] = useState<any[]>([]);
  const [quakeLoading, setQuakeLoading] = useState(false);

  // Search Suggestion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const AI_API_URL = "https://fikalalif-fault-detection-api.hf.space";
  const DB_API_URL = "https://fault-dbservice.vercel.app/api";

  // --- USE EFFECT: FETCH GEMPA ---
  useEffect(() => {
    if (step === 3 && coords) {
      const fetchQuakes = async () => {
        setQuakeLoading(true);
        try {
          // 1. Hitung tanggal 10 tahun ke belakang
          const today = new Date();
          const pastDate = new Date(today.setFullYear(today.getFullYear() - 10));
          const dateString = pastDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

          // 2. Request ke USGS dengan parameter starttime & minmagnitude
          // radius: 100km, min-mag: 4.0, waktu: 10 tahun terakhir
          const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${coords.lat}&longitude=${coords.lng}&maxradiuskm=20&minmagnitude=4.0&starttime=${dateString}&limit=5&orderby=time`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setEarthquakeHistory(data.features || []);
          }
        } catch (e) {
          console.error("Gagal ambil data gempa", e);
        } finally {
          setQuakeLoading(false);
        }
      };
      fetchQuakes();
    }
  }, [step, coords]);

  // --- USE EFFECT: AUTOCOMPLETE ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery
            )}&limit=5&addressdetails=1`,
            { headers: { "Accept-Language": "id", "User-Agent": "GeoValidApp/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(true);
          }
        } catch (e) { /* Silent fail */ }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- HANDLER FILE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleGPS = () => {
    setLoading(true);
    setStatusText("Mencari titik GPS...");
    if ("geolocation" in navigator) {
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

  const handleSearchLocation = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setStatusText("Mencari lokasi...");

    try {
      const coordPattern = /^(-?\d+(\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;
      const match = searchQuery.trim().match(coordPattern);

      if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[3]);
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          setCoords({ lat, lng: lon });
          setLoading(false);
          setStatusText("");
          return;
        }
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        { headers: { "Accept-Language": "id", "User-Agent": "GeoValidApp/1.0", "Accept": "application/json" } }
      );

      if (!res.ok) throw new Error("Gagal menghubungi layanan peta.");
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Layanan peta sedang sibuk.");
      }

      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoords({ lat, lng: lon });
        setShowSuggestions(false);
      } else {
        alert("Lokasi tidak ditemukan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mencari lokasi.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile || !coords) return;

    setLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const predictFormData = new FormData();
      predictFormData.append("file", selectedFile);

      const locationFormData = new FormData();
      locationFormData.append("latitude", coords.lat.toString());
      locationFormData.append("longitude", coords.lng.toString());

      setStatusText("Menganalisis Visual, Lokasi & Dampak...");

      // Helper safeJson
      const safeJson = async (res: Response, name: string) => {
        const text = await res.text();
        try {
          if (!res.ok) throw new Error(text || `${name} Error`);
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Respon server ${name} tidak valid.`);
        }
      };

      const [resPredict, resLocation, infrastructureData] = await Promise.all([
        fetch(`${AI_API_URL}/predict`, { method: "POST", body: predictFormData }),
        fetch(`${AI_API_URL}/cek_lokasi`, { method: "POST", body: locationFormData }),
        analyzeImpact(coords.lat, coords.lng)
      ]);

      const dataPredict = await safeJson(resPredict, "AI Visual");
      const dataLocation = await safeJson(resLocation, "Cek Lokasi");

      setPredictData(dataPredict);
      setLocationData(dataLocation);
      setImpactList(infrastructureData); 

      setStep(3);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const handleSave = async () => {
    if (!predictData || !locationData) return;
    setSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesi habis, silakan login ulang.");

      if (!selectedFile) throw new Error("File gambar tidak ditemukan.");

      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("detection-image")
        .upload(fileName, selectedFile);

      if (uploadError) throw new Error(`Gagal upload: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("detection-image")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Payload Database
      const payload = {
        latitude: coords!.lat,
        longitude: coords!.lng,
        imageUrl: imageUrl,
        originalImageUrl: imageUrl,
        overlayImageUrl: predictData.images_base64?.overlay || "",
        maskImageUrl: predictData.images_base64?.mask || "",
        detectionResult:
          predictData.fault_analysis?.deskripsi_singkat ||
          "Tidak Teridentifikasi",
        // Simpan semua detail analisis dalam format JSON di kolom description
        description: JSON.stringify({
          visual_statement: predictData.statement,
          visual_status: predictData.fault_analysis?.status_level,
          location_status: locationData.status,
          fault_name: locationData.nama_patahan,
          fault_distance: locationData.jarak_km,
          impact_count: impactList.length, // Jumlah bangunan terdampak
          impact_details: impactList, // Detail bangunan (array)
          analysis_timestamp: new Date().toISOString(),
        }),
      };

      const res = await fetch(`${DB_API_URL}/detections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan ke database.");

      setIsSaved(true);
      alert("Data deteksi dan analisis dampak berhasil disimpan!");
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
    setImpactList([]);
    setEarthquakeHistory([]);
    setSearchQuery("");
    setIsSaved(false);
    setImageViewMode('overlay');
  };

  // --- RENDER STEPS ---

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

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">Langkah 2: Tentukan Lokasi</h2>
        <p className="text-sm text-gray-500">Di mana foto ini diambil? Cari lokasi atau gunakan GPS.</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="flex gap-2 relative z-50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari lokasi..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[9999]">
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-0 flex flex-col"
                      onMouseDown={() => {
                        setSearchQuery(item.display_name);
                        setCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium text-gray-900 truncate">{item.name || item.display_name.split(',')[0]}</span>
                      <span className="text-xs text-gray-500 truncate">{item.display_name}</span>
                    </li>
                  ))}
                </ul>
              )}
          </div>
          <button onClick={handleSearchLocation} className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"><Search className="h-4 w-4" /></button>
          <button onClick={handleGPS} className="bg-orange-600 text-white px-3 rounded-lg flex items-center gap-2 hover:bg-orange-700 whitespace-nowrap text-sm font-medium"><MapPin className="h-4 w-4" /> <span className="hidden sm:inline">GPS Saya</span></button>
        </div>
        <div className="relative">
          <MapPicker position={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
        </div>
        <div className="bg-gray-50 p-3 rounded text-center text-xs text-gray-600">
          {coords ? `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}` : "Pilih lokasi di peta"}
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"><ChevronLeft className="h-4 w-4" /> Kembali</button>
        <button onClick={runAnalysis} disabled={!coords || loading} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition">
          {loading ? (<div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /><span>{statusText || "Memproses..."}</span></div>) : "Mulai Analisis"}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const imageStatus = predictData?.fault_analysis?.status_level || "";
    const locationStatusStr = locationData?.status || "";
    const isImageDanger = imageStatus.includes("PERINGATAN") || imageStatus.includes("BAHAYA");
    const isLocationDanger = locationStatusStr.includes("ZONA PERINGATAN") || locationStatusStr.includes("BAHAYA");
    
    // Logic Gabungan Status
    const isDanger = isImageDanger && isLocationDanger;
    const isWarning = !isDanger && (isImageDanger || isLocationDanger);

    // Data Gambar untuk Switcher
    const images = {
        original: preview,
        overlay: predictData?.images_base64?.overlay, 
        mask: predictData?.images_base64?.mask        
    };

    return (
      <div className="space-y-6 animate-fade-in pb-10">
        
        {/* --- 1. RESULT HEADER --- */}
        <div className={`p-6 rounded-2xl border-l-8 shadow-sm ${
            isDanger ? "bg-red-50 border-red-500 text-red-900" : 
            isWarning ? "bg-orange-50 border-orange-500 text-orange-900" : 
            "bg-green-50 border-green-500 text-green-900"
        }`}>
          <div className="flex items-start gap-4">
            {isDanger ? <AlertTriangle className="h-10 w-10 shrink-0" /> : isWarning ? <Info className="h-10 w-10 shrink-0" /> : <CheckCircle className="h-10 w-10 shrink-0" />}
            <div>
              <h3 className="font-bold text-xl uppercase tracking-wide mb-1">
                {isDanger ? "STATUS: BAHAYA TINGGI" : isWarning ? "STATUS: PERINGATAN" : "STATUS: AMAN"}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed font-medium">
                {isDanger ? "Terdeteksi pola retakan sesar aktif DAN lokasi berada di zona merah." : 
                 isWarning ? "Waspada! Salah satu indikator (Visual/Lokasi) menunjukkan potensi bahaya." : 
                 "Lokasi dan struktur batuan relatif aman dari indikasi sesar aktif."}
              </p>
            </div>
          </div>
        </div>

        {/* --- 2. MULTI-VIEW IMAGE RESULT --- */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Analisis Visual
                </span>
                <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
                    <button onClick={() => setImageViewMode('original')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${imageViewMode === 'original' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}>Asli</button>
                    <button onClick={() => setImageViewMode('overlay')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${imageViewMode === 'overlay' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}>Overlay</button>
                    <button onClick={() => setImageViewMode('mask')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${imageViewMode === 'mask' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}>Masker</button>
                </div>
            </div>
            
            <div className="p-1 bg-black">
                <div className="relative aspect-video w-full">
                    {images[imageViewMode] ? (
                        <Image 
                            src={images[imageViewMode]} 
                            alt={`Result ${imageViewMode}`} 
                            fill 
                            className="object-contain" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white/50 text-sm">
                            Gambar {imageViewMode} tidak tersedia.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t">
                <p><strong>Analisis AI:</strong> {predictData?.statement}</p>
            </div>
        </div>

        {/* --- 2.5 ANALISIS GEOSPASIAL (DIKEMBALIKAN) --- */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" /> Analisis Lokasi & Jarak Sesar
            </h3>
            <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className={`p-3 rounded-full ${isLocationDanger ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        <Ruler className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Zona Geologis</p>
                        <p className="font-bold text-gray-900 text-lg">{locationData?.status || "-"}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600 text-sm">Sesar Terdekat</span>
                        <span className="font-bold text-gray-900">{locationData?.nama_patahan || "Tidak terdeteksi"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600 text-sm">Jarak ke Pusat Sesar</span>
                        <span className="font-mono font-bold text-orange-600">{locationData?.jarak_km ? `${locationData.jarak_km} km` : "-"}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- 3. REKOMENDASI MITIGASI --- */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 font-bold text-blue-800 flex items-center gap-2">
                <HardHat className="h-5 w-5" /> Rekomendasi Mitigasi & Konstruksi
            </div>
            <div className="p-6">
                {isDanger ? (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="bg-red-100 p-2 rounded-full"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
                            <div>
                                <h4 className="font-bold text-red-700">Zona Terlarang Hunian</h4>
                                <p className="text-sm text-gray-600">Lokasi ini direkomendasikan sebagai area konservasi, perkebunan, atau wisata alam. Hindari pembangunan hunian permanen.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-orange-100 p-2 rounded-full"><Hammer className="h-6 w-6 text-orange-600" /></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Jika Terpaksa Membangun</h4>
                                <p className="text-sm text-gray-600">Wajib menggunakan struktur bangunan tahan gempa (misal: RISHA) dan material ringan (kayu/baja ringan).</p>
                            </div>
                        </div>
                    </div>
                ) : isWarning ? (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="bg-yellow-100 p-2 rounded-full"><Info className="h-6 w-6 text-yellow-600" /></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Perkuatan Struktur Diperlukan</h4>
                                <p className="text-sm text-gray-600">Pastikan pondasi bangunan mencapai tanah keras. Gunakan ikatan beton bertulang (sloof, kolom, ring balok) yang standar.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 items-start">
                        <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div>
                        <div>
                            <h4 className="font-bold text-gray-800">Zona Layak Bangun</h4>
                            <p className="text-sm text-gray-600">Lokasi relatif aman. Tetap ikuti standar SNI bangunan gedung untuk ketahanan jangka panjang.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- 4. RIWAYAT GEMPA --- */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" /> Riwayat Gempa (Radius 20km)
            </h3>
            
            {quakeLoading ? (
                <div className="flex justify-center py-4 text-gray-400 text-sm animate-pulse">Mengambil data USGS...</div>
            ) : earthquakeHistory.length > 0 ? (
                <div className="space-y-3">
                    {earthquakeHistory.map((quake, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${quake.properties.mag >= 5 ? 'bg-red-500' : 'bg-orange-400'}`}>
                                    {quake.properties.mag.toFixed(1)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-700 truncate w-40 sm:w-auto">{quake.properties.place}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(quake.properties.time).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Waves className="h-3 w-3" /> {quake.geometry.coordinates[2]}km
                            </span>
                        </div>
                    ))}
                    <p className="text-[10px] text-gray-400 text-center mt-2">Sumber: USGS Earthquake Catalog</p>
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">Tidak ada catatan gempa signifikan terkini.</p>
            )}
        </div>

        {/* --- 5. INFRASTRUKTUR --- */}
        {impactList.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" /> Infrastruktur Terdampak
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    {impactList.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                {item.type === 'school' && <GraduationCap className="h-4 w-4 text-orange-600" />}
                                {item.type === 'hospital' && <Stethoscope className="h-4 w-4 text-red-600" />}
                                {item.type === 'government' && <Landmark className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-500">{item.distance}m dari titik</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TOMBOL AKSI */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <button onClick={handleReset} className="flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 px-6 py-3 rounded-xl transition border border-gray-200 w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" /> Deteksi Ulang
          </button>
          <button onClick={handleSave} disabled={saving || isSaved} className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition w-full sm:w-auto ${isSaved ? "bg-green-600 hover:bg-green-700 cursor-default" : "bg-orange-700 hover:bg-orange-800"} disabled:opacity-70 disabled:cursor-not-allowed`}>
            {saving ? (<span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Menyimpan...</span>) : isSaved ? (<span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Tersimpan</span>) : (<span className="flex items-center gap-2"><Save className="h-4 w-4" /> Simpan Laporan</span>)}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6 pb-24 relative z-0">
      <div className="flex items-center justify-center mb-8 gap-2">
        {[1, 2, 3].map((i) => (<div key={i} className={`h-2 w-16 rounded-full transition-all ${step >= i ? "bg-gray-900" : "bg-gray-200"}`} />))}
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