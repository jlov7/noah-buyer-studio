"use client";
import React, { useState } from 'react';
import { BRAND } from '@/lib/brand';

export default function BrandMark({ className = '' }: { className?: string }) {
  const [ok, setOk] = useState(true);
  return (
    <a href={BRAND.website} target="_blank" rel="noreferrer" className={["inline-flex items-center gap-2", className].join(' ')}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={BRAND.logo}
          alt={BRAND.name}
          className="h-6 w-6 rounded"
          onError={() => setOk(false)}
        />
      ) : (
        <span className="h-6 w-6 rounded bg-white/10" />
      )}
      <span className="text-sm text-gray-200 hover:underline">{BRAND.name}</span>
    </a>
  );
}

