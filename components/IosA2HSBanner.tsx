"use client";
import { useEffect, useState } from 'react';

export default function IosA2HSBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone;
    if (isIos && !isStandalone) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  if (!show) return null;
  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[92%] -translate-x-1/2 rounded-xl border border-white/10 bg-black/80 p-3 text-sm text-white shadow-xl">
      <div className="font-semibold">Add to Home Screen</div>
      <div className="mt-1 opacity-90">
        On iOS: tap the Share icon and choose Add to Home Screen.
      </div>
      <button className="mt-2 text-brand underline" onClick={() => setShow(false)}>
        Got it
      </button>
    </div>
  );
}
