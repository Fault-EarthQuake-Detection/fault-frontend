/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import {
  User,
  Lock,
  Info,
  MessageSquare,
  LogOut,
  ChevronRight,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
};

// URL Backend
const DB_API_URL = "https://fault-dbservice.vercel.app/api";

// --- KOMPONEN INPUT PASSWORD (DIPINDAHKAN KE LUAR) ---
// Agar tidak re-render/hilang fokus saat mengetik
const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  setShow: (val: boolean) => void;
  placeholder: string;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-3 pr-10 rounded-lg outline-none focus:border-blue-500 transition"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  </div>
);


export default function SettingsView({ initialUser }: { initialUser: any }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Deteksi Provider Login (Google / Email)
  const isGoogleUser = initialUser?.app_metadata?.provider === "google";

  const [user, setUser] = useState<UserData>({
    id: initialUser.id,
    email: initialUser.email || "",
    username: initialUser.user_metadata?.username || "User",
    avatar_url: initialUser.user_metadata?.avatar_url || "",
  });

  const supabase = createClient();
  const router = useRouter();

  // --- LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  // --- SUB COMPONENTS (Logic Only) ---

  // 1. EDIT PROFIL
  const EditProfile = () => {
    const [name, setName] = useState(user.username);
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [preview, setPreview] = useState(user.avatar_url || null);
    const fileInput = useRef<HTMLInputElement>(null);

    const handleSaveProfile = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Sesi habis");

        let finalAvatarUrl = user.avatar_url;

        // Upload Foto jika ada yang baru
        if (imgFile) {
          const fileName = `${user.id}-${Date.now()}.png`;

          const { error: upErr } = await supabase.storage
            .from("avatar-profile")
            .upload(fileName, imgFile, { upsert: true });

          if (upErr) throw upErr;

          const { data: urlData } = supabase.storage
            .from("avatar-profile")
            .getPublicUrl(fileName);

          finalAvatarUrl = urlData.publicUrl;
        }

        // Kirim ke Backend
        const res = await fetch(`${DB_API_URL}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ username: name, avatarUrl: finalAvatarUrl }),
        });

        if (!res.ok) throw new Error("Gagal update profil");

        setUser((prev) => ({
          ...prev,
          username: name,
          avatar_url: finalAvatarUrl || "",
        }));
        
        router.refresh(); 
        alert("Profil berhasil diperbarui!");
        setActiveMenu(null);
      } catch (e: any) {
        alert("Error: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6 animate-fade-in relative z-30">
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInput.current?.click()}
          >
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
              {preview ? (
                <Image
                  src={preview}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="h-full w-full p-4 text-gray-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera className="text-white" />
            </div>
            <input
              type="file"
              ref={fileInput}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImgFile(e.target.files[0]);
                  setPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
          </div>
          <p className="text-sm text-gray-500">Ketuk foto untuk mengganti</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Username</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={loading}
          className="w-full bg-orange-700 text-white py-3 rounded-lg font-bold hover:bg-orange-800 transition flex justify-center items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" /> Simpan Perubahan
            </>
          )}
        </button>
      </div>
    );
  };

  // 2. GANTI PASSWORD
  const ChangePassword = () => {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirm, setConfirm] = useState("");

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUpdatePass = async () => {
      if (!oldPass || !newPass || !confirm)
        return alert("Semua kolom wajib diisi.");
      if (newPass !== confirm) return alert("Password konfirmasi tidak sama!");
      if (newPass.length < 6) return alert("Password baru minimal 6 karakter");

      setLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Sesi habis");

        const res = await fetch(`${DB_API_URL}/change-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPass,
            newPassword: newPass,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Gagal ganti password");
        }

        alert("Password berhasil diganti! Silakan login ulang.");
        await handleLogout();
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-5 animate-fade-in relative z-30">
        <PasswordInput
          label="Password Lama"
          value={oldPass}
          onChange={setOldPass}
          show={showOld}
          setShow={setShowOld}
          placeholder="Masukkan password saat ini"
        />
        <hr className="border-gray-100" />
        <PasswordInput
          label="Password Baru"
          value={newPass}
          onChange={setNewPass}
          show={showNew}
          setShow={setShowNew}
          placeholder="Minimal 6 karakter"
        />
        <PasswordInput
          label="Konfirmasi Password Baru"
          value={confirm}
          onChange={setConfirm}
          show={showConfirm}
          setShow={setShowConfirm}
          placeholder="Ulangi password baru"
        />

        <button
          type="button"
          onClick={handleUpdatePass}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Ganti Password"}
        </button>
      </div>
    );
  };

  // 3. SARAN DAN KRITIK
  const FeedbackForm = () => {
    const [content, setContent] = useState("");

    const sendFeedback = async () => {
      if (!content.trim()) return;
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Sesi habis");

        const res = await fetch(`${DB_API_URL}/feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) throw new Error("Gagal kirim saran");
        alert("Terima kasih atas masukan Anda!");
        setActiveMenu(null);
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4 animate-fade-in relative z-30">
        <p className="text-sm text-gray-600">
          Masukan Anda sangat berarti untuk pengembangan GeoValid.
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
          placeholder="Tulis saran atau kritik Anda di sini..."
        />
        <button
          type="button"
          onClick={sendFeedback}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
        >
          {loading ? "Mengirim..." : "Kirim Masukan"}
        </button>
      </div>
    );
  };

  // 4. TENTANG APLIKASI
  const AboutApp = () => (
    <div className="space-y-4 animate-fade-in text-center py-6 relative z-30">
      <Image
        src="/logo_geovalid.png"
        alt="Logo"
        width={80}
        height={80}
        className="mx-auto"
      />
      <h3 className="text-xl font-bold text-gray-800">GeoValid</h3>
      <p className="text-sm text-gray-500">Versi 1.0.0 (Beta)</p>
      <div className="text-sm text-gray-600 text-left bg-gray-50 p-4 rounded-lg border mt-4">
        <p className="mb-2">
          Aplikasi ini dikembangkan untuk membantu masyarakat dalam mendeteksi dan
          memvalidasi jalur sesar aktif menggunakan teknologi AI dan data
          Geospasial ESDM.
        </p>
        <p>© 2025 GeoValid Team.</p>
      </div>
    </div>
  );

  // --- MAIN RENDER ---

  if (activeMenu) {
    let title = "";
    let Component = null;

    switch (activeMenu) {
      case "profile":
        title = "Edit Profil";
        Component = <EditProfile />;
        break;
      case "password":
        title = "Ganti Password";
        Component = <ChangePassword />;
        break;
      case "about":
        title = "Tentang Aplikasi";
        Component = <AboutApp />;
        break;
      case "feedback":
        title = "Saran & Kritik";
        Component = <FeedbackForm />;
        break;
    }

    return (
      <div className="max-w-md mx-auto p-4 relative z-30">
        <button
          type="button"
          onClick={() => setActiveMenu(null)}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:bg-gray-100 p-2 rounded-lg w-fit transition"
        >
          <ArrowLeft className="h-5 w-5" /> Kembali
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          {title}
        </h2>
        {Component}
      </div>
    );
  }

  // Tampilan Menu Utama
  return (
    <div className="max-w-xl mx-auto p-6 space-y-8 relative z-30">
      {/* Header Profil Singkat */}
      <div className="flex items-center gap-4 p-4 bg-white border rounded-xl shadow-sm">
        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden relative">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt="Ava"
              fill
              className="object-cover"
            />
          ) : (
            <User className="h-full w-full p-3 text-gray-400" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{user.username}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          {isGoogleUser && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
              Google Account
            </span>
          )}
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setActiveMenu("profile")}
          className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:bg-gray-50 transition shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition">
              <User className="h-5 w-5" />
            </div>
            <span className="font-medium text-gray-700">Edit Profil</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        {!isGoogleUser && (
          <button
            type="button"
            onClick={() => setActiveMenu("password")}
            className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:bg-gray-50 transition shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition">
                <Lock className="h-5 w-5" />
              </div>
              <span className="font-medium text-gray-700">Ganti Password</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveMenu("about")}
          className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:bg-gray-50 transition shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition">
              <Info className="h-5 w-5" />
            </div>
            <span className="font-medium text-gray-700">Tentang Aplikasi</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu("feedback")}
          className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:bg-gray-50 transition shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="font-medium text-gray-700">Saran & Kritik</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-medium text-red-600">Keluar</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}