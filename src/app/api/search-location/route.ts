/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

// PENTING: Paksa route ini jadi dinamis agar tidak di-cache statis oleh Next.js
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Encode query agar aman dari spasi dan karakter aneh
    const safeQuery = encodeURIComponent(query);
    
    // URL Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${safeQuery}&limit=5&countrycodes=id&addressdetails=1`;
    
    // Fetch ke Nominatim
    const res = await fetch(nominatimUrl, {
      method: 'GET',
      headers: {
        // User-Agent WAJIB unik. Jangan pakai "Mozilla/..." generik.
        // Format disarankan: NamaApp/Versi (EmailContact)
        'User-Agent': 'GeoValid-App/1.0 (admin@geovalid.com)', 
        'Accept-Language': 'id-ID,id;q=0.9',
        'Accept': 'application/json',
      },
      // Matikan cache fetch agar selalu dapat data fresh
      cache: 'no-store', 
    });

    // Ambil response sebagai TEXT dulu (bukan langsung json) untuk debugging
    const responseText = await res.text();

    // Cek status HTTP dari Nominatim
    if (!res.ok) {
      console.error(`[Nominatim Error] Status: ${res.status}, Body: ${responseText}`);
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` }, 
        { status: res.status }
      );
    }

    // Coba parsing manual JSON-nya
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("[Nominatim Parse Error] Response is not JSON:", responseText);
      return NextResponse.json(
        { error: 'Invalid JSON response from provider' }, 
        { status: 502 } // Bad Gateway
      );
    }

  } catch (error: any) {
    console.error('[API Route Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}