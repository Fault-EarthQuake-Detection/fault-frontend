import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // LOG 1: Cek apakah Route terpanggil
  console.log("🚀 [Callback] Route Triggered!");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard/home';

  if (code) {
    console.log("✅ [Callback] Code found:", code.substring(0, 5) + "..."); // Log potongan code

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    // Tukar Code
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("✅ [Callback] Session Exchange Success");
      
      // Ambil User
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        console.log("👤 [Callback] User found:", user.email);

        // --- MULAI PROSES SYNC KE BACKEND ---
        try {
          // Logic Username
          const derivedUsername = user.user_metadata.full_name 
            ? user.user_metadata.full_name.replace(/\s+/g, '').toLowerCase() 
            : user.email?.split('@')[0];

          // Pastikan URL Backend Benar
          // GANTI URL INI JIKA MASIH LOCALHOST: "http://localhost:5000/api/auth/google-sync"
          const BACKEND_URL = " https://fault-dbservice.vercel.app/auth/google-sync"; 
          
          console.log(`📡 [Callback] Sending data to Backend: ${BACKEND_URL}`);
          console.log("📦 [Callback] Payload:", JSON.stringify({
             id: user.id,
             email: user.email,
             username: derivedUsername
          }, null, 2));

          const backendRes = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id, 
              email: user.email,
              username: derivedUsername,
              avatarUrl: user.user_metadata.avatar_url
            }),
          });

          // BACA RESPONSE TEXT DARI BACKEND (PENTING BUAT DEBUG)
          const responseText = await backendRes.text();
          
          if (backendRes.ok) {
             console.log("🎉 [Callback] SUCCESS Sync to DB:", responseText);
          } else {
             console.error("🔥 [Callback] FAILED Sync to DB. Status:", backendRes.status);
             console.error("🔥 [Callback] Error Body:", responseText);
          }

        } catch (err) {
          console.error("💥 [Callback] FATAL ERROR during fetch:", err);
        }
      } else {
        console.log("⚠️ [Callback] No user found after exchange");
      }
    } else {
      console.error("❌ [Callback] Exchange Error:", error.message);
    }
  } else {
    console.log("⚠️ [Callback] No code parameter found");
  }

  // Redirect
  console.log("🔄 [Callback] Redirecting to:", `${requestUrl.origin}${next}`);
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}