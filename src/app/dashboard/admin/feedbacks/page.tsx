/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, User, PieChart as PieChartIcon, AlertCircle } from "lucide-react"; // Tambah Icon Alert
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Image from "next/image";

// Pastikan Port Backend Benar (Biasanya Backend Port 5000, Frontend 3000)
const API_URL = "https://fault-dbservice.vercel.app/api"; 

export default function FeedbacksPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{feedbacks: any[], summary: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Tambah State Error
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Cek Session dulu
            if (!session) throw new Error("Tidak ada sesi login.");

            const res = await fetch(`${API_URL}/admin/feedbacks-analytics`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

            // Jika response bukan 200 OK
            if (!res.ok) {
                const errData = await res.json().catch(() => ({})); 
                throw new Error(errData.error || `Gagal memuat data (${res.status})`);
            }

            const jsonData = await res.json();
            setData(jsonData);

        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || "Terjadi kesalahan server");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-orange-600"/></div>;
  
  // TAMPILKAN ERROR JIKA ADA
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="h-10 w-10 mb-2"/>
        <p className="font-bold">Gagal Memuat Data</p>
        <p className="text-sm">{error}</p>
    </div>
  );

  // Handle jika data kosong tapi tidak error (return null sebelumnya bikin blank)
  if (!data) return <div className="text-center py-10 text-gray-500">Tidak ada data feedback.</div>;

  return (
    <div className="space-y-6">
        {/* ... (SISA KODE RENDER SAMA SEPERTI SEBELUMNYA) ... */}
         {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center">
                <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Total Feedback</h3>
                <p className="text-5xl font-black text-gray-900">{data.feedbacks.length}</p>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-orange-600" /> Sentimen Analisis
                </h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data.summary} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {data.summary.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="middle" align="right" layout="vertical" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* List Feedback */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50"><h3 className="font-bold">Ulasan Terbaru</h3></div>
            <div className="divide-y divide-gray-100">
                {data.feedbacks.map((fb) => (
                    <div key={fb.id} className="p-4 flex gap-4 hover:bg-gray-50">
                        <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden relative">
                            {fb.user?.avatarUrl ? <Image src={fb.user.avatarUrl} alt="Ava" fill className="object-cover"/> : <User className="p-2 h-full w-full text-gray-400"/>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="font-bold text-sm">{fb.user?.username || "Anonim"}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                    fb.sentimentLabel === 'Positif' ? 'bg-green-100 text-green-700' : 
                                    fb.sentimentLabel === 'Negatif' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}>{fb.sentimentLabel}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{fb.content}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(fb.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}