/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Loader2, User, PieChart as PieChartIcon, 
  AlertCircle, ChevronUp, 
  ArrowRight, Microscope 
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Image from "next/image";

const API_URL = "https://fault-dbservice.vercel.app/api"; 

// --- 1. DEFINISI TIPE DATA (Sesuai Backend Baru) ---
type NLPSteps = {
  tokens: string[];
  filtered: string[];
  stemmed: string[];
};

type Feedback = {
  id: number;
  content: string;
  createdAt: string;
  sentimentScore: number;
  sentimentLabel: string;
  nlpSteps?: NLPSteps; // Data Preprocessing dari Backend
  user?: {
    username: string;
    avatarUrl?: string;
  };
};

type AnalyticsResponse = {
  feedbacks: Feedback[];
  summary: { name: string; value: number; fill: string }[];
};

// --- 2. KOMPONEN ITEM FEEDBACK (Bisa di-expand) ---
function FeedbackItem({ fb }: { fb: Feedback }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="p-4 flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-200">
            {fb.user?.avatarUrl ? (
                <Image src={fb.user.avatarUrl} alt="Ava" fill className="object-cover"/>
            ) : <User className="p-2 h-full w-full text-gray-400"/>}
        </div>

        {/* Content */}
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <div>
                    <span className="font-bold text-sm text-gray-900 block">{fb.user?.username || "Anonim"}</span>
                    <span className="text-xs text-gray-400 block">{new Date(fb.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                
                {/* Sentiment Badge */}
                <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        fb.sentimentLabel === 'Positif' ? 'bg-green-50 text-green-700 border-green-200' : 
                        fb.sentimentLabel === 'Negatif' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                        {fb.sentimentLabel} ({fb.sentimentScore > 0 ? `+${fb.sentimentScore}` : fb.sentimentScore})
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{fb.content}</p>

            {/* Tombol Toggle Analisis */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="mt-3 text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline"
            >
                {isOpen ? <ChevronUp size={14}/> : <Microscope size={14}/>}
                {isOpen ? "Tutup Analisis" : "Lihat Proses NLP (Preprocessing)"}
            </button>
        </div>
      </div>

      {/* --- 3. VISUALISASI PIPELINE NLP (Ini buat Dosen) --- */}
      {isOpen && fb.nlpSteps && (
         <div className="bg-gray-50 p-4 mx-4 mb-4 rounded-xl border border-dashed border-gray-300 text-xs">
            <h4 className="font-bold text-gray-500 mb-3 uppercase tracking-wider text-[10px]">Dapur Analisis Sentimen (Sastrawi)</h4>
            
            <div className="space-y-4">
                {/* Step 1: Tokenizing */}
                <div>
                    <span className="font-bold text-blue-600 block mb-1">1. Tokenizing (Pemecahan Kata)</span>
                    <div className="flex flex-wrap gap-1">
                        {fb.nlpSteps.tokens.map((t, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600">{t}</span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center"><ArrowRight size={14} className="text-gray-300 rotate-90"/></div>

                {/* Step 2: Filtering */}
                <div>
                    <span className="font-bold text-orange-600 block mb-1">2. Filtering (Stopword Removal)</span>
                    <div className="flex flex-wrap gap-1">
                        {fb.nlpSteps.filtered.map((t, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-orange-50 border border-orange-100 rounded text-orange-800">{t}</span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center"><ArrowRight size={14} className="text-gray-300 rotate-90"/></div>

                {/* Step 3: Stemming */}
                <div>
                    <span className="font-bold text-green-600 block mb-1">3. Stemming (Kata Dasar) & Scoring</span>
                    <div className="flex flex-wrap gap-1 items-center">
                        {fb.nlpSteps.stemmed.map((t, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-green-100 border border-green-200 rounded text-green-800 font-bold">{t}</span>
                        ))}
                        <ArrowRight size={14} className="mx-2 text-gray-400"/>
                        <span className="font-bold bg-black text-white px-2 py-0.5 rounded">Score: {fb.sentimentScore}</span>
                    </div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function FeedbacksPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Tidak ada sesi login.");

            const res = await fetch(`${API_URL}/admin/feedbacks-analytics`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

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
  
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="h-10 w-10 mb-2"/>
        <p className="font-bold">Gagal Memuat Data</p>
        <p className="text-sm">{error}</p>
    </div>
  );

  if (!data || data.feedbacks.length === 0) return <div className="text-center py-10 text-gray-500">Tidak ada data feedback.</div>;

  return (
    <div className="space-y-6 pb-20">
         {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center">
                <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Total Ulasan</h3>
                <p className="text-5xl font-black text-gray-900">{data.feedbacks.length}</p>
                <p className="text-xs text-gray-400 mt-2">Ulasan dari pengguna</p>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-orange-600" /> Distribusi Sentimen
                </h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data.summary} 
                                cx="50%" cy="50%" 
                                innerRadius={60} outerRadius={80} 
                                paddingAngle={5} dataKey="value"
                            >
                                {data.summary.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                            />
                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* List Feedback dengan NLP Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Ulasan Terbaru</h3>
                <span className="text-xs text-gray-500 italic">Klik tombol Lihat Proses NLP untuk detail</span>
            </div>
            
            <div className="divide-y divide-gray-100">
                {data.feedbacks.map((fb) => (
                    <FeedbackItem key={fb.id} fb={fb} />
                ))}
            </div>
        </div>
    </div>
  );
}