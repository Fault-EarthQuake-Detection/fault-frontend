import Image from 'next/image';
import Link from 'next/link'; // Import Link

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10">
      <h1 className="text-4xl font-bold">Selamat Datang di GeoValid</h1>
      <p>Aplikasi Deteksi Patahan Gempa Anda.</p>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="rounded bg-blue-600 px-6 py-2 text-white"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="rounded bg-gray-200 px-6 py-2 text-black"
        >
          Dashboard (Protected)
        </Link>
      </div>
    </div>
  );
}