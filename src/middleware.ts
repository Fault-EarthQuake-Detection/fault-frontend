import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh sesi
  const { data: { session } } = await supabase.auth.getSession();

  // Jika user tidak login dan mencoba akses dashboard, tendang ke login
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}

// Tentukan halaman mana yang mau "dijaga" oleh satpam
export const config = {
  matcher: [
  ],
};