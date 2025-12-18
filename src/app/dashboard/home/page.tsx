import DashboardLayout from "@/app/components/dashboard/DashBoardLayout";
import LandingPage from "@/components/landing/LandingPage";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";


const imageMetadata = {
  icons: {
    icon: "/asset/logo_geovalid.png",
  },
};

export const metadata: Metadata = {
  title: "Home",
  description: "Aplikasi Validasi Data Geospasial untuk Deteksi Retakan pada Tebing dan Batuan",
  icons: imageMetadata.icons,
};

export default async function HomePage() {
  const supabase = await createClient(); 
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // LOGIKA TAMPILAN:
  // 1. Jika user sudah login, langsung masuk ke Dashboard.
  if (user) {
    return <DashboardLayout user={user} />;
  }

  // 2. Jika user belum login, tampilkan Slide/Landing Page terlebih dahulu.
  // User akan menekan tombol "Masuk" atau "Daftar" di LandingPage untuk login.
  return <LandingPage />;
}