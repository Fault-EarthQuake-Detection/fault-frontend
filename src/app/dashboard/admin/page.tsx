"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // Import Router untuk redirect
import { 
  Shield, CheckCircle2, XCircle, Trash2, 
  User, LayoutGrid, Users, Loader2, MapPin, Calendar, 
  Image as ImageIcon, Eye, Layers, Maximize2, ExternalLink, X,
  ArrowLeft // <-- TAMBAHKAN ICON ARROW LEFT
} from "lucide-react";
import Image from "next/image";


// Pastikan URL API Backend benar
const API_URL = "http://localhost:3000/api"; 

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'validations' | 'users'>('validations');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // STATE KEAMANAN
  const [isCheckingRole, setIsCheckingRole] = useState(true); // Default true agar loading dulu
  const [isAuthorized, setIsAuthorized] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter(); // Init router

  // --- 1. SECURITY CHECK (Jalan Pertama Kali) ---
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Jika tidak login, lempar ke login
        if (!session) {
            router.replace('/auth/login');
            return;
        }

        // Cek Role Asli ke Backend
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (res.ok) {
            const userProfile = await res.json();
            
            // LOGIKA PENENTUAN: Apakah dia ADMIN?
            if (userProfile.role === 'ADMIN') {
                setIsAuthorized(true);
                setIsCheckingRole(false);
            } else {
                // JIKA BUKAN ADMIN
                alert("⛔ AKSES DITOLAK!\nHalaman ini khusus untuk Administrator.");
                router.replace('/dashboard/home'); // Tendang ke Home
            }
        } else {
            throw new Error("Gagal verifikasi role");
        }

      } catch (err) {
        console.error("Auth Check Error:", err);
        router.replace('/dashboard/home'); // Error = Tendang
      }
    };

    checkAdminAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. FETCH DATA (Hanya jalan jika sudah Authorized) ---
  const fetchData = async () => {
    if (!isAuthorized) return; // Cegah fetch jika belum lolos cek

    setLoading(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const endpoint = activeTab === 'users' ? '/admin/users' : '/admin/detections';
        
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            setDataList(data);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    } finally {
        setLoading(false);
    }
  };

  // Jalankan fetch data saat Tab berubah ATAU saat status Authorized berubah jadi true
  useEffect(() => {
    if (isAuthorized) {
        fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthorized]);

  // --- ACTIONS ---
  const handleValidate = async (id: number, isValid: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/admin/detections/${id}/validate`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}` 
      },
      body: JSON.stringify({ isValid })
    });
    
    setSelectedReport(null);
    fetchData(); 
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Apakah Anda yakin ingin menghapus data ini secara permanen?")) return;
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/admin/detections/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    setSelectedReport(null);
    fetchData();
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}` 
      },
      body: JSON.stringify({ role: newRole })
    });
    fetchData();
  };

  // --- SUB-COMPONENT: MODAL DETAIL ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ReportDetailModal = ({ report, onClose }: { report: any, onClose: () => void }) => {
    const [viewMode, setViewMode] = useState<'original' | 'overlay' | 'mask'>('overlay');
    
    let aiAnalysis = null;
    try {
        aiAnalysis = JSON.parse(report.description || '{}');
    } catch (e) {
        aiAnalysis = { visual_statement: report.description };
    }

    const currentImage = 
        viewMode === 'original' ? report.originalImageUrl :
        viewMode === 'mask' ? (report.maskImageUrl || report.originalImageUrl) :
        (report.overlayImageUrl || report.originalImageUrl);

    return (
        
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up">
                
                {/* Header Modal */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-orange-600" />
                            Detail Laporan #{report.id}
                        </h2>
                        <p className="text-sm text-gray-500">Dikirim pada {new Date(report.createdAt).toLocaleString('id-ID')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-0 flex flex-col md:flex-row">
                    
                    {/* LEFT: IMAGE VIEWER */}
                    <div className="w-full md:w-2/3 bg-black flex flex-col">
                        <div className="flex-1 relative min-h-[300px] md:min-h-[400px]">
                            {currentImage ? (
                                <Image 
                                    src={currentImage} 
                                    alt="Detail View" 
                                    fill 
                                    className="object-contain" 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white/50">
                                    <ImageIcon className="h-16 w-16 mb-2" />
                                </div>
                            )}
                            
                            <div className="absolute top-4 left-4">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                                    report.isValidated 
                                    ? 'bg-green-500/90 text-white' 
                                    : 'bg-yellow-500/90 text-white'
                                }`}>
                                    {report.isValidated ? "Sudah Divalidasi" : "Menunggu Review"}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-4 flex justify-center gap-4">
                            <button 
                                onClick={() => setViewMode('original')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewMode === 'original' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                            >
                                <ImageIcon className="h-4 w-4" /> Foto Asli
                            </button>
                            <button 
                                onClick={() => setViewMode('overlay')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewMode === 'overlay' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                            >
                                <Eye className="h-4 w-4" /> AI Overlay
                            </button>
                            <button 
                                onClick={() => setViewMode('mask')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewMode === 'mask' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                            >
                                <Layers className="h-4 w-4" /> Masker
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: DETAILS */}
                    <div className="w-full md:w-1/3 p-6 bg-white space-y-6 overflow-y-auto border-l">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden relative">
                                {report.user?.avatarUrl ? (
                                    <Image src={report.user.avatarUrl} alt="User" fill className="object-cover" />
                                ) : (
                                    <User className="h-full w-full p-2 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{report.user?.username || "Anonim"}</p>
                                <p className="text-xs text-gray-500">{report.user?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jenis Sesar</label>
                                <p className="text-lg font-bold text-gray-900">{report.faultType || "Tidak Diketahui"}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi</label>
                                <div className="flex items-start gap-2 mt-1">
                                    <MapPin className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700">{report.address || "Alamat tidak tersedia"}</p>
                                </div>
                                <a 
                                    href={`http://googleusercontent.com/maps.google.com/?q=${report.latitude},${report.longitude}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 mt-2"
                                >
                                    <ExternalLink className="h-3 w-3" /> Buka di Google Maps
                                </a>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
                                    <Maximize2 className="h-3 w-3" /> Analisis AI
                                </h4>
                                <p className="text-sm text-blue-900 leading-relaxed">
                                    {aiAnalysis.visual_statement || "Tidak ada detail tambahan dari sistem AI."}
                                </p>
                                {aiAnalysis.fault_distance && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                        <p className="text-xs text-blue-800">
                                            Jarak ke Sesar: <strong>{aiAnalysis.fault_distance} km</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={() => handleDelete(report.id)}
                        className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" /> Hapus
                    </button>
                    
                    {!report.isValidated ? (
                        <button 
                            onClick={() => handleValidate(report.id, true)}
                            className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2"
                        >
                            <CheckCircle2 className="h-4 w-4" /> Validasi & Tampilkan
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleValidate(report.id, false)}
                            className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-bold text-sm hover:bg-yellow-600 shadow-lg shadow-yellow-200 flex items-center gap-2"
                        >
                            <XCircle className="h-4 w-4" /> Batalkan Validasi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
  };

  // --- RENDER UTAMA ---
  
  // Jika sedang mengecek role, tampilkan Loading Fullscreen agar User tidak bisa lihat konten
  if (isCheckingRole) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="h-12 w-12 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memverifikasi akses Administrator...</p>
        </div>
    );
  }

  // Jika tidak authorized (meskipun biasanya sudah di-redirect di useEffect), return null
  if (!isAuthorized) return null;

  return (

    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10 pb-32 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {selectedReport && (
            <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
        )}

        {/* Header dan Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                {/* TOMBOL KEMBALI KE HOME */}
                <button 
                    onClick={() => router.push('/dashboard/home')}
                    className="mt-1 p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                    title="Kembali ke Dashboard"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>

                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Shield className="h-8 w-8 text-orange-600" fill="currentColor" fillOpacity={0.1} />
                        Admin Console
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Pusat kontrol untuk validasi data geospasial & manajemen pengguna.
                    </p>
                </div>
            </div>
            
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex self-start md:self-center">
                <button 
                    onClick={() => setActiveTab('validations')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'validations' 
                        ? 'bg-orange-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Validasi Data
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'users' 
                        ? 'bg-orange-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <Users className="h-4 w-4" />
                    Pengguna
                </button>
            </div>
        </div>

        {/* LOADING DATA */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-orange-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Memuat data...</p>
            </div>
        )}

        {/* CONTENT */}
        {!loading && activeTab === 'validations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                {dataList.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400">Tidak ada laporan yang perlu divalidasi.</p>
                    </div>
                ) : (
                    dataList.map((report) => {
                        const imageSrc = report.overlayImageUrl || report.originalImageUrl;
                        return (
                        <div key={report.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div 
                                className="relative h-48 w-full bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer"
                                onClick={() => setSelectedReport(report)}
                            >
                                {imageSrc ? (
                                    <Image src={imageSrc} alt="Bukti Deteksi" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                        <span className="text-xs font-medium">Gambar Tidak Tersedia</span>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <Maximize2 className="h-3 w-3" /> Lihat Detail
                                    </div>
                                </div>

                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                                        report.isValidated ? 'bg-green-500/90 text-white' : 'bg-yellow-500/90 text-white'
                                    }`}>
                                        {report.isValidated ? "Verified" : "Pending"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex-1 cursor-pointer" onClick={() => setSelectedReport(report)}>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                        {report.faultType || "Pola Tidak Diketahui"}
                                    </h3>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                            <User className="h-3 w-3" /> {report.user?.username || "Anonim"}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                            <Calendar className="h-3 w-3" /> {new Date(report.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {report.address && (
                                        <div className="flex items-start gap-2 text-xs text-gray-600 mb-4">
                                            <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{report.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-4">
                                    {!report.isValidated ? (
                                        <button onClick={() => handleValidate(report.id, true)} className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition border border-green-200">
                                            <CheckCircle2 className="h-4 w-4" /> Terima
                                        </button>
                                    ) : (
                                        <button onClick={() => handleValidate(report.id, false)} className="flex-1 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-yellow-100 transition border border-yellow-200">
                                            <XCircle className="h-4 w-4" /> Batal
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(report.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus Permanen">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})
                )}
            </div>
        )}

        {!loading && activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pengguna</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {dataList.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                                {u.avatarUrl ? <Image src={u.avatarUrl} alt="Ava" width={40} height={40} /> : <User className="h-5 w-5 text-gray-400" />}
                                            </div>
                                            <span className="font-semibold text-gray-900">{u.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)} className="text-xs border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 py-1.5 px-3 bg-white text-gray-900">
                                            <option value="USER">User Biasa</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}