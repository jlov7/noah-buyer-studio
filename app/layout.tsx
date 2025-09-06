"use client";
import './globals.css';
import type { Metadata } from 'next';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import IosA2HSBanner from '@/components/IosA2HSBanner';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';

const StepNav = dynamic(() => import('@/components/ui/StepNav'), { ssr: false });

export const metadata: Metadata = {
  title: 'Noah Buyer Studio',
  description: '3-minute buyer intake, Austin map overlays, and smart tour.',
  manifest: '/manifest.json',
  themeColor: '#0e1218',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [openShare, setOpenShare] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ServiceWorkerRegister />
        <IosA2HSBanner />
        <main className="container py-6">
          <header className="mb-6 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold">Noah Buyer Studio</Link>
            <nav className="flex items-center gap-3 text-sm text-gray-300">
              <Link href="/">Intake</Link>
              <Link href="/map">Map</Link>
              <Link href="/tour">Tour</Link>
              <button
                className="btn bg-white/10 hover:bg-white/20"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    setOpenShare(true);
                  }
                }}
                title="Copy shareable link"
              >
                {copied ? 'Copied!' : 'Share this app'}
              </button>
              <button className="btn bg-white/10 hover:bg-white/20" onClick={() => setOpenShare(true)}>How to share</button>
            </nav>
          </header>
          <div className="mb-4 text-sm text-gray-300">
            A mobile-friendly PWA to collect a 3-minute buyer intake, explore Austin map overlays, and build a smart tour with realistic ETAs — no external API keys required.
          </div>
          <StepNav />
          {children}
        </main>
        <Modal open={openShare} onClose={() => setOpenShare(false)} title="Share this app (Codespaces)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Open Ports panel in Codespaces.</li>
            <li>Find port <strong>3000</strong>, set it to <strong>Public</strong>.</li>
            <li>Copy the forwarded URL and send it to your buyer.</li>
          </ol>
          <p className="mt-2">Tip: Use the Share button to copy the current link.</p>
        </Modal>
        <div className="sticky-cta">
          <div className="container flex items-center justify-between py-3 text-sm">
            <div>Plan your Austin tour with Noah</div>
            <Link href="/tour" className="btn">Plan tour with Noah</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
