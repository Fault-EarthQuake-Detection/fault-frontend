// src/components/dashboard/ContentFeed.tsx

'use client';

import type { User as SupabaseUser } from '@supabase/supabase-js';

type ContentFeedProps = {
  user: SupabaseUser | null;
};

export default function ContentFeed({ user }: ContentFeedProps) {
  // Data dummy agar mirip mockup
  const articles = [
    {
      source: 'bmkg.go.id',
      title: 'Antisipasi Gempa Bumi',
    },
    {
      source: 'tempo.co',
      title: 'Zona Merah Sesar Lembang',
    },
    {
      source: 'tempo.co',
      title: 'Zona Merah Sesar Lembang',
    },
  ];

  return (
    // Kontainer utama (tidak berubah)
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Loop data dummy */}
        {articles.map((article, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border bg-white shadow-sm"
          >
            {/* Note 1: Buat gambar menjadi persegi (aspect-square) */}
            <div className="w-full aspect-square bg-gray-200" />
            <div className="p-4">
              <span className="text-sm font-medium text-red-600">
                {article.source}
              </span>
              <h3 className="mt-1 font-semibold text-gray-900">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}