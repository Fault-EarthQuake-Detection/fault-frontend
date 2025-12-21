/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  MapPin,
  Loader2,
  Search,
  ChevronRight,
  ChevronLeft,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Building, // Icon untuk Dampak
  GraduationCap, // Icon Sekolah
  Stethoscope, // Icon RS
  Landmark, // Icon Pemerintah
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
// Pastikan file utils/impactAnalysis.ts sudah dibuat sesuai instruksi sebelumnya
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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Data hasil API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [predictData, setPredictData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locationData, setLocationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // State untuk Analisis Dampak Infrastruktur
  const [impactList, setImpactList] = useState<ImpactItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const AI_API_URL = "https://fikalalif-fault-detection-api.hf.space";
  const DB_API_URL = "https://fault-dbservice.vercel.app/api";

  useEffect(() => {
    // Gunakan timer agar tidak spam API setiap ketik 1 huruf (Debounce 500ms)
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery
            )}&limit=5&addressdetails=1`,
            { headers: { "Accept-Language": "id" } }
          );
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(true);
          }
        } catch (e) {
          // Silent error jika gagal fetch saran (biar ga ganggu user)
        }
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

  // --- HANDLER LOKASI ---
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

  // --- PERBAIKAN: Handle Search Location dengan Error Handling ---
  const handleSearchLocation = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setStatusText("Mencari lokasi...");

    try {
      // 1. Cek Regex Koordinat (Kode Lama Tetap Ada)
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

      // 2. Fetch ke API (DIBUNGKUS TRY-CATCH UTAMA)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: { "Accept-Language": "id" },
        }
      );

      if (!res.ok) throw new Error("Gagal menghubungi layanan peta.");

      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoords({ lat, lng: lon });
        setShowSuggestions(false); // Tutup saran jika user tekan tombol search manual
      } else {
        alert("Lokasi tidak ditemukan. Coba nama yang lebih spesifik.");
      }
    } catch (err) {
      console.error(err);
      // Tampilkan alert yang jelas ke user mobile
      alert("Gagal mencari lokasi. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  // --- RUN ANALYSIS (UPDATE: TAMBAH IMPACT ANALYSIS) ---
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

      // Jalankan 3 Proses secara Paralel: AI Gambar, Cek Sesar, Cek Infrastruktur
      const [resPredict, resLocation, infrastructureData] = await Promise.all([
        fetch(`${AI_API_URL}/predict`, {
          method: "POST",
          body: predictFormData,
        }),
        fetch(`${AI_API_URL}/cek_lokasi`, {
          method: "POST",
          body: locationFormData,
        }),
        analyzeImpact(coords.lat, coords.lng), // Fungsi utilitas baru
      ]);

      if (!resPredict.ok)
        throw new Error(`AI Error: ${await resPredict.text()}`);
      if (!resLocation.ok)
        throw new Error(`Location Error: ${await resLocation.text()}`);

      const dataPredict = await resPredict.json();
      const dataLocation = await resLocation.json();

      setPredictData(dataPredict);
      setLocationData(dataLocation);
      setImpactList(infrastructureData); // Simpan hasil dampak

      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  // --- MANUAL SAVE (UPDATE: SIMPAN IMPACT KE DESCRIPTION) ---
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
    setImpactList([]); // Reset impact
    setSearchQuery("");
    setIsSaved(false);
  };

  // --- RENDER STEPS ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">
          Langkah 1: Ambil Citra Batuan
        </h2>
        <p className="text-sm text-gray-500">
          Unggah foto tebing atau batuan yang ingin dianalisis.
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        {!preview ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-orange-300 bg-orange-50 rounded-xl hover:bg-orange-100 transition h-48"
            >
              <Camera className="h-10 w-10 text-orange-600 mb-2" />
              <span className="font-semibold text-orange-700">
                Ambil Foto (Kamera)
              </span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl hover:bg-gray-100 transition h-48"
            >
              <Upload className="h-10 w-10 text-gray-500 mb-2" />
              <span className="font-semibold text-gray-600">
                Pilih dari Galeri
              </span>
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-video w-full relative bg-black rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs shadow hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <div className="flex justify-end">
        <button
          onClick={() => setStep(2)}
          disabled={!selectedFile}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Lanjut ke Lokasi <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">
          Langkah 2: Tentukan Lokasi
        </h2>
        <p className="text-sm text-gray-500">
          Di mana foto ini diambil? Cari lokasi atau gunakan GPS.
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        {/* ... di dalam renderStep2 ... */}
        <div className="flex gap-2 relative z-50">
          {" "}
          {/* Tambahkan z-50 agar dropdown di atas */}
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
              // Delay tutup agar klik pada list terbaca
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />

            {/* --- DROPDOWN REKOMENDASI --- */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[100]">
                {suggestions.map((item, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-0 flex flex-col"
                    onMouseDown={() => {
                      // Pakai onMouseDown agar trigger sebelum onBlur
                      setSearchQuery(item.display_name);
                      setCoords({
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon),
                      });
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="font-medium text-gray-900 truncate">
                      {item.name || item.display_name.split(",")[0]}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {item.display_name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleSearchLocation}
            className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={handleGPS}
            className="bg-orange-600 text-white px-3 rounded-lg flex items-center gap-2 hover:bg-orange-700 whitespace-nowrap text-sm font-medium"
          >
            <MapPin className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">GPS Saya</span>
          </button>
        </div>
        <div className="relative">
          <MapPicker
            position={coords}
            onLocationSelect={(lat, lng) => setCoords({ lat, lng })}
          />
        </div>
        <div className="bg-gray-50 p-3 rounded text-center text-xs text-gray-600">
          {coords
            ? `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`
            : "Pilih lokasi di peta"}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali
        </button>
        <button
          onClick={runAnalysis}
          disabled={!coords || loading}
          className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>{statusText || "Memproses..."}</span>
            </div>
          ) : (
            "Mulai Analisis"
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const imageStatus = predictData?.fault_analysis?.status_level || "";
    const locationStatusStr = locationData?.status || "";
    const isImageDanger =
      imageStatus.includes("PERINGATAN") || imageStatus.includes("BAHAYA");
    const isLocationDanger =
      locationStatusStr.includes("ZONA PERINGATAN") ||
      locationStatusStr.includes("BAHAYA");
    const isDanger = isImageDanger && isLocationDanger;
    const isWarning = isImageDanger || isLocationDanger;

    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            Hasil Analisis Terpadu
          </h2>
        </div>

        {/* STATUS BAR */}
        <div
          className={`p-6 rounded-xl border-l-4 shadow-sm ${
            isDanger
              ? "bg-red-50 border-red-500 text-red-900"
              : isWarning
              ? "bg-orange-50 border-orange-500 text-orange-900"
              : "bg-green-50 border-green-500 text-green-900"
          }`}
        >
          <div className="flex items-start gap-4">
            {isDanger ? (
              <AlertTriangle className="h-8 w-8 shrink-0" />
            ) : isWarning ? (
              <Info className="h-8 w-8 shrink-0" />
            ) : (
              <CheckCircle className="h-8 w-8 shrink-0" />
            )}
            <div>
              <h3 className="font-bold text-lg uppercase mb-1">
                {isDanger
                  ? "STATUS: BAHAYA TINGGI"
                  : isWarning
                  ? "STATUS: PERINGATAN"
                  : "STATUS: AMAN"}
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
            <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">
              Analisis Visual (AI)
            </div>
            <div className="p-4 space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {predictData?.images_base64?.overlay ? (
                  <img
                    src={predictData.images_base64.overlay}
                    alt="Overlay Result"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-xs">
                    Visual tidak tersedia
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div
                  className={`p-3 rounded border-l-4 ${
                    isImageDanger
                      ? "bg-red-50 border-red-500"
                      : "bg-green-50 border-green-500"
                  }`}
                >
                  <p className="font-bold text-gray-800">
                    {predictData?.fault_analysis?.deskripsi_singkat || "-"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {predictData?.statement}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* HASIL LOKASI */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-fit">
            <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">
              Analisis Geospasial
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-full ${
                    isLocationDanger
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zona Sesar</p>
                  <p className="font-bold text-gray-800">
                    {isLocationDanger ? "Zona Peringatan" : "Zona Aman"}
                  </p>
                </div>
              </div>
              <div className="border-t pt-3 space-y-3 text-sm">
                <p className="italic text-gray-600 bg-gray-50 p-2 rounded">
                  &quot;{locationData?.status}&quot;
                </p>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sesar Terdekat:</span>
                  <span className="font-medium text-right">
                    {locationData?.nama_patahan || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jarak:</span>
                  <span className="font-medium">
                    {locationData?.jarak_km
                      ? `${locationData.jarak_km} km`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FITUR BARU: ANALISIS DAMPAK INFRASTRUKTUR --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Analisis Dampak (Radius 1 KM)
          </h3>

          {impactList.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">
                Ditemukan{" "}
                <strong>{impactList.length} infrastruktur penting</strong> di
                sekitar titik deteksi ini:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {impactList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-red-50 transition border-l-4 border-l-gray-300 hover:border-l-red-500"
                  >
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                      {item.type === "school" && (
                        <GraduationCap className="h-5 w-5 text-orange-600" />
                      )}
                      {item.type === "hospital" && (
                        <Stethoscope className="h-5 w-5 text-red-600" />
                      )}
                      {item.type === "government" && (
                        <Landmark className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p
                        className="text-sm font-bold text-gray-800 truncate"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        Jarak:{" "}
                        <span className="font-mono font-bold text-red-600">
                          {item.distance}m
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-green-800">Area Relatif Aman</p>
              <p className="text-sm text-green-600">
                Tidak ditemukan sekolah, rumah sakit, atau kantor pemerintah
                dalam radius 1 KM.
              </p>
            </div>
          )}
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 px-6 py-3 rounded-xl transition border border-gray-200 w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" /> Deteksi Ulang
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isSaved}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition w-full sm:w-auto ${
              isSaved
                ? "bg-green-600 hover:bg-green-700 cursor-default"
                : "bg-orange-700 hover:bg-orange-800"
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" /> Menyimpan...
              </span>
            ) : isSaved ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Tersimpan
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Simpan Laporan & Dampak
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    // TAMBAHKAN relative z-30 di pembungkus paling luar
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6 pb-24 relative z-30">
      <div className="flex items-center justify-center mb-8 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 w-16 rounded-full transition-all ${
              step >= i ? "bg-gray-900" : "bg-gray-200"
            }`}
          />
        ))}
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
