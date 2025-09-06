"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const url = '/sw.js';
      navigator.serviceWorker
        .register(url)
        .catch((err) => console.warn('SW registration failed', err));
    }
  }, []);
  return null;
}

