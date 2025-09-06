"use client";
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function HelpTip({ title = 'Help', children, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className={["relative inline-block", className].join(' ')}>
      <button
        type="button"
        aria-label={`${title} tooltip`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs text-white hover:bg-white/20"
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <div className="absolute left-1/2 z-50 mt-2 w-64 -translate-x-1/2 rounded-md border border-white/10 bg-black/80 p-2 text-xs text-white shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
}

