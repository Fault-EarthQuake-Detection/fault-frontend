"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  motion, 
  useScroll, 
  useTransform, 
  AnimatePresence, 
  useSpring,
  useMotionValue,
  useMotionTemplate,
  Variants 
} from "framer-motion";
import { 
  ArrowRight, Map, Camera, Menu, X, 
  ShieldAlert, UserCheck, ChevronDown, CheckCircle2, 
  Smartphone, BrainCircuit, ScanSearch, Layers, Globe, Activity
} from "lucide-react";

// --- UTILITY ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- ANIMATION VARIANTS ---
const revealVariant: Variants = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax Hero
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- FIX SCROLL LOGIC ---
  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false); // Tutup menu dulu
    const element = document.getElementById(id);
    if (element) {
        // Gunakan setTimeout kecil untuk membiarkan menu menutup animasi dulu (opsional tapi smooth)
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden relative">
      
      {/* Scroll Progress Bar (Top) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-red-600 origin-left z-[9999]"
        style={{ scaleX }}
      />

      {/* --- BACKGROUND TEXTURE & ORBS --- */}
      <div className="fixed inset-0 z-[0] opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
            animate={{ x: [0, 50, 0], y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-orange-100/60 blur-[120px]" 
        />
        <motion.div 
            animate={{ x: [0, -30, 0], y: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-100/50 blur-[120px]" 
        />
      </div>

      {/* --- 1. NAVBAR --- */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-[900] transition-all duration-300 px-6 md:px-12",
          isScrolled 
            ? "py-3 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm" 
            : "py-6 bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group relative z-[950]">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
               <Image src="/asset/logo_geovalid.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-gray-900">
              Geo<span className="text-orange-600">Valid</span>.
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {[
              { label: "Edukasi", id: "edukasi" },
              { label: "Teknologi", id: "teknologi" },
              { label: "Cara Kerja", id: "cara-kerja" },
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleScrollTo(item.id)}
                className="hover:text-orange-600 transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-orange-600 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
            <Link 
              href="/auth/login"
              className="px-6 py-2.5 rounded-full bg-gray-900 text-white hover:bg-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 font-semibold text-xs tracking-wide uppercase transform hover:-translate-y-0.5"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className="md:hidden p-2 text-gray-800 bg-white/80 rounded-full border border-gray-200 shadow-sm z-[950] relative active:scale-95 transition-transform"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay (FIX: Fixed Position & Z-Index Max) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inset-0 bg-white/95 backdrop-blur-2xl z-[950] flex flex-col items-center justify-center space-y-8 md:hidden p-8"
            >
              {[
                { label: "Edukasi Geologi", id: "edukasi" },
                { label: "Teknologi AI", id: "teknologi" },
                { label: "Cara Penggunaan", id: "cara-kerja" },
                { label: "Tentang Kami", id: "posisi" }
              ].map((item, idx) => (
                 <motion.button 
                   key={item.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 + (idx * 0.1) }} 
                   onClick={() => handleScrollTo(item.id)}
                   className="text-3xl font-bold text-gray-800 hover:text-orange-600 transition-colors py-2 px-4"
                 >
                   {item.label}
                 </motion.button>
              ))}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-8"
              >
                <Link 
                    href="/auth/login"
                    className="px-10 py-5 rounded-full bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 active:scale-95 transition-all w-full text-center te "
                >
                    Mulai Deteksi
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- 2. HERO SECTION (CINEMATIC REVEAL) --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 min-h-[95vh] flex flex-col justify-center items-center overflow-hidden">
        <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className="max-w-4xl mx-auto text-center relative z-10"
        >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-8 cursor-default hover:bg-orange-100 transition-colors"
            >
              <Smartphone size={14} />
              <span>Teknologi Geologi Untuk Semua</span>
            </motion.div>

            {/* Cinematic Text Reveal */}
            <h1 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tight leading-[0.9] mb-8">
               <div className="overflow-hidden">
                 <motion.span variants={revealVariant} initial="hidden" animate="visible" className="inline-block">Kenali</motion.span>{" "}
                 <motion.span variants={revealVariant} initial="hidden" animate="visible" className="inline-block text-orange-600">Tanda</motion.span>{" "}
                 <motion.span variants={revealVariant} initial="hidden" animate="visible" className="inline-block">Alam,</motion.span>
               </div>
               <div className="overflow-hidden mt-1 md:mt-4">
                 <motion.span variants={revealVariant} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="inline-block">Lindungi</motion.span>{" "}
                 <motion.span variants={revealVariant} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="inline-block text-gray-400">Masa</motion.span>{" "}
                 <motion.span variants={revealVariant} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="inline-block">Depan.</motion.span>
               </div>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            >
              Platform AI canggih untuk memetakan potensi bahaya geologi di sekitar Anda. 
              Ambil foto, analisis risiko, dan berkontribusi.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <MagneticButton className="w-full sm:w-auto">
                    <Link 
                        href="/auth/login"
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full font-bold shadow-2xl hover:bg-orange-600 transition-colors w-full"
                    >
                        <Camera size={20} />
                        Mulai Scan Foto
                    </Link>
                </MagneticButton>
                
                <button 
                    onClick={() => handleScrollTo('edukasi')}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-gray-700 border border-gray-200 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 group"
                >
                    Pelajari Dulu
                    <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform text-gray-400"/>
                </button>
            </motion.div>
        </motion.div>
        
        {/* Abstract Globe Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] opacity-[0.03] z-0 pointer-events-none">
            <Image src="/globe.svg" alt="" fill className="object-contain animate-spin-slow" />
        </div>
      </section>

      {/* --- 3. EDUKASI GEOLOGI --- */}
      <section id="edukasi" className="py-24 px-6 relative z-10 bg-gradient-to-b from-gray-50 to-white scroll-mt-24">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-orange-600 font-bold tracking-wider uppercase text-xs mb-3 block">Wawasan Dasar</span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Mengapa Harus Peduli?</h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                   Retakan pada batuan bukan cuma soal estetika. Itu bisa jadi petunjuk awal adanya pergeseran tanah atau jalur sesar aktif di bawah kaki kita.
                </p>
            </div>
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                <TiltCard 
                    icon={<ScanSearch size={36} className="text-blue-500" />}
                    title="Identifikasi Retakan"
                    desc="Kenali batuan Breksi (Breccia) atau tanah yang retak memanjang. Ini sering menandakan zona hancuran akibat patahan."
                />
                <TiltCard 
                    icon={<Map size={36} className="text-orange-500" />}
                    title="Hindari Zona Merah"
                    desc="Mengetahui lokasi patahan membantu kita menghindari membangun rumah di zona yang tanahnya labil dan berbahaya."
                />
                <TiltCard 
                    icon={<ShieldAlert size={36} className="text-red-500" />}
                    title="Kontribusi Data"
                    desc="Foto yang Anda kirim membantu ahli geologi memetakan area yang belum terjangkau. Anda bisa menyelamatkan nyawa."
                />
            </motion.div>
        </div>
      </section>

      {/* --- 4. TEKNOLOGI (MODERN DARK UI) --- */}
      <section id="teknologi" className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16">
                
                <div className="flex-1 space-y-8">
                    <div className="inline-block px-3 py-1 bg-orange-900/50 border border-orange-500/30 rounded-full text-orange-400 text-xs font-bold uppercase tracking-wider">
                        Powered by AI
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        Cerdas & Presisi <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                            Tanpa Kompromi.
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed font-light">
                        Kami menggunakan <strong>Convolutional Neural Networks (CNN)</strong>, teknologi yang sama dengan mobil otonom, untuk "melihat" dan menganalisis struktur batuan dari foto Anda.
                    </p>
                    <ul className="space-y-4">
                        <TechItem text="Akurasi deteksi retakan hingga 95%." />
                        <TechItem text="Hasil analisis keluar dalam < 2 detik." />
                        <TechItem text="Terintegrasi dengan peta satelit real-time." />
                    </ul>
                </div>

                <div className="flex-1 w-full">
                    <div className="relative aspect-square md:aspect-[4/3] bg-gray-800/40 rounded-3xl border border-gray-700/50 p-6 md:p-8 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                         <div className="grid grid-cols-2 gap-4 w-full h-full">
                            <TechCard 
                                icon={<Layers size={24} className="text-orange-400"/>} 
                                label="Layer Analysis" 
                                value="Multi-Scan"
                            />
                            <TechCard 
                                icon={<BrainCircuit size={24} className="text-blue-400"/>} 
                                label="AI Model" 
                                value="DeepLabV3+ & ResNet101"
                            />
                            <TechCard 
                                icon={<Globe size={24} className="text-green-400"/>} 
                                label="Mapping" 
                                value="GeoSpatial"
                            />
                            <TechCard 
                                icon={<Activity size={24} className="text-purple-400"/>} 
                                label="Speed" 
                                value="5s / img"
                            />
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- 5. CARA KERJA --- */}
      <section id="cara-kerja" className="py-24 px-6 bg-white relative scroll-mt-24">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Simpel Banget.</h2>
                <p className="text-gray-500">Gak perlu jadi ahli buat ikutan jaga bumi.</p>
            </div>

            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block z-0"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <StepCard 
                        number="01" 
                        title="Foto" 
                        desc="Ketemu batu aneh atau tanah retak? Langsung jepret pakai HP."
                    />
                    <StepCard 
                        number="02" 
                        title="Upload" 
                        desc="Masuk ke aplikasi GeoValid, upload fotonya. Biar AI yang kerja."
                    />
                    <StepCard 
                        number="03" 
                        title="Hasil" 
                        desc="Keluar status: Aman/Bahaya, plus lokasinya di peta."
                    />
                </div>
            </div>
        </div>
      </section>

      {/* --- 6. DISCLAIMER --- */}
      <section id="posisi" className="py-20 px-6 bg-orange-50/50 border-y border-orange-100 scroll-mt-24">
         <div className="max-w-4xl mx-auto text-center">
            <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-orange-100/50 border border-white"
            >
                <div className="inline-flex items-center gap-2 text-orange-600 font-bold mb-6 uppercase tracking-wider text-sm bg-orange-50 px-4 py-2 rounded-full">
                    <UserCheck size={18} />
                    <span>Transparansi Publik</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                    Kami Adalah "Alarm Awal", <br/>Bukan Hakim Akhir.
                </h2>
                <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
                    <p>
                        Hasil analisis GeoValid bertujuan untuk meningkatkan kewaspadaan (awareness).
                    </p>
                    <div className="mt-6 flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-left">
                        <ShieldAlert className="text-yellow-600 shrink-0 mt-1" size={24} />
                        <p className="text-sm md:text-base font-medium text-yellow-800 m-0">
                            <strong>DISCLAIMER:</strong> Keputusan teknis sipil, izin bangunan, dan mitigasi bencana skala besar 
                            tetap <strong>WAJIB</strong> dikonsultasikan dengan Ahli Geologi Profesional atau badan resmi (BMKG/PVMBG).
                        </p>
                    </div>
                </div>
            </motion.div>
         </div>
      </section>

      {/* --- 7. FOOTER CTA --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-600 rounded-full blur-[120px] opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Mulai Sekarang, Gratis.
                </h2>
                <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                    Tanpa biaya, tanpa ribet. Jadilah mata bagi keselamatan lingkungan kita.
                </p>
                <MagneticButton className="inline-block">
                    <Link 
                        href="/auth/login"
                        className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/10"
                    >
                        Masuk Dashboard <ArrowRight size={20}/>
                    </Link>
                </MagneticButton>
            </div>
        </div>
      </section>

      {/* --- 8. FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 opacity-90">
                <div className="relative w-8 h-8">
                     <Image src="/asset/logo_geovalid.png" alt="Logo" fill className="object-contain" />
                </div>
                <div>
                    <span className="font-bold text-gray-900 tracking-tight block leading-none">GeoValid</span>
                    <span className="text-[10px] text-gray-400 font-mono">Ver 1.0 (Public Release)</span>
                </div>
            </div>
            
            <p className="text-xs text-gray-400 font-mono text-center md:text-right">
                © {new Date().getFullYear()} GeoValid Team.<br/>
                Dibuat dengan ❤️ untuk Indonesia 🇮🇩
            </p>
        </div>
      </footer>
    </div>
  );
}

// --- SUB COMPONENTS ---

// 1. TILT CARD (3D Effect)
function TiltCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    return (
        <motion.div 
            style={{ x, y, rotateX, rotateY, z: 100 }}
            whileHover={{ y: -5, cursor: "default" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col items-center text-center group hover:border-orange-200 transition-colors"
        >
            <div className="p-4 bg-gray-50 rounded-2xl mb-6 group-hover:bg-orange-50 transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    )
}

// 2. MAGNETIC BUTTON
function MagneticButton({ children, className }: { children: React.ReactNode, className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        const center = { x: left + width / 2, y: top + height / 2 };
        x.set((clientX - center.x) * 0.1);
        y.set((clientY - center.y) * 0.1);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function TechCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-4 md:p-5 flex flex-col justify-between hover:bg-gray-750 transition-colors group"
        >
            <div className="flex justify-between items-start">
                {icon}
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>
            <div>
                <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
                <p className="text-white text-lg font-bold group-hover:text-orange-400 transition-colors">{value}</p>
            </div>
        </motion.div>
    )
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg relative z-10 text-center md:text-left group"
        >
            <span className="text-5xl font-black text-gray-100 absolute top-4 right-4 group-hover:text-orange-50 transition-colors duration-500 select-none">
                {number}
            </span>
            <h4 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">{title}</h4>
            <p className="text-gray-500 leading-relaxed relative z-10">{desc}</p>
        </motion.div>
    )
}

function TechItem({ text }: { text: string }) {
    return (
        <motion.li 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
        >
            <div className="p-1 bg-green-500/20 rounded-full text-green-400 shrink-0">
                <CheckCircle2 size={16} />
            </div>
            <span className="text-gray-300 font-light">{text}</span>
        </motion.li>
    )
}