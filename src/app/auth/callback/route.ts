import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // Redirect default ke Dashboard Home kalau 'next' tidak ada
  const next = requestUrl.searchParams.get('next') ?? '/dashboard/home'; 

  if (code) {
    const cookieStore = await cookies();
    
    // 1. Setup Supabase Client Manual (Sesuai kode lu, aman buat Cookie Next 15)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // 2. Tukar Code Google jadi Session Supabase
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 3. [PENTING] AMBIL DATA USER YANG BARU LOGIN
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 4. [LOGIKA SYNC] Tembak Backend Express buat simpan User ke DB
        try {
          // Bikin username otomatis dari nama/email karena Google gak kasih username
          const derivedUsername = user.user_metadata.full_name 
            ? user.user_metadata.full_name.replace(/\s+/g, '').toLowerCase() 
            : user.email?.split('@')[0];

          // Panggil Endpoint Backend kita
          const backendRes = await fetch("https://fault-dbservice.vercel.app/auth/google-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id, // UUID Supabase (Wajib sama biar sinkron)
              email: user.email,
              username: derivedUsername,
              avatarUrl: user.user_metadata.avatar_url
            }),
          });

          if (backendRes.ok) {
             console.log("✅ Google User Berhasil Disimpan di Database");
          } else {
             console.error("⚠️ Gagal simpan ke DB:", await backendRes.text());
          }

        } catch (err) {
          console.error("❌ Error Koneksi ke Backend:", err);
          // Kita biarkan user masuk (redirect) walaupun DB gagal sync, biar gak stuck error
        }
      }
    }
  }

  // 5. Redirect User Masuk
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}