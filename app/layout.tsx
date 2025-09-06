"use client";
import './globals.css';
import type { Metadata } from 'next';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import IosA2HSBanner from '@/components/IosA2HSBanner';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import BrandMark from '@/components/BrandMark';
import { BRAND } from '@/lib/brand';

const StepNav = dynamic(() => import('@/components/ui/StepNav'), { ssr: false });

export const metadata: Metadata = {
  title: 'Noah Buyer Studio',
  description: '3-minute buyer intake, Austin map overlays, and smart tour.',
  manifest: '/manifest.json',
  themeColor: '#0e1218',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [openShare, setOpenShare] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/brand/logo.svg" />
        <link rel="icon" href="/brand/logo.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ ['--brand-color' as any]: BRAND.colors.primary, ['--brand-color-dark' as any]: BRAND.colors.dark, ['--brand-color-light' as any]: BRAND.colors.light }}>
        <ServiceWorkerRegister />
        <IosA2HSBanner />
        <main className="container py-6">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-semibold">Noah Buyer Studio</Link>
              <span className="hidden text-gray-500 md:inline">·</span>
              <BrandMark className="hidden md:inline-flex" />
            </div>
            <nav className="flex items-center gap-3 text-sm text-gray-300">
              <Link href="/">Intake</Link>
              <Link href="/map">Map</Link>
              <Link href="/tour">Tour</Link>
              <Link href="/brand" className="hidden md:inline">Brand</Link>
              <button className="btn bg-white/10 hover:bg-white/20" onClick={() => setOpenAbout(true)}>About</button>
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
        <div className="print-only">
          {BRAND.name} — {BRAND.website} • About this demo: https://github.com/jlov7/noah-buyer-studio
        </div>
        <Modal open={openShare} onClose={() => setOpenShare(false)} title="Share this app (Codespaces)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Open Ports panel in Codespaces.</li>
            <li>Find port <strong>3000</strong>, set it to <strong>Public</strong>.</li>
            <li>Copy the forwarded URL and send it to your buyer.</li>
          </ol>
          <p className="mt-2">Tip: Use the Share button to copy the current link.</p>
        </Modal>
        <Modal open={openAbout} onClose={() => setOpenAbout(false)} title="About this demo">
          <div className="space-y-2">
            <p>
              This is an illustrative demo for discussion. It is not affiliated with or endorsed by any brokerage. Replace demo brand assets before any external use.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Zero‑key build: GitHub Models (server‑side via Codespaces GITHUB_TOKEN), OSRM public routing, MapLibre + OSM tiles (demo use; attribution visible).</li>
              <li>Compliance cues: neutral school language; TREC §535.17 price disclosure shown under price content.</li>
              <li>Routing: avoids Google Distance/Places with non‑Google maps due to Google TOS.</li>
              <li>Open source: see README and docs in this repo for details.</li>
            </ul>
            <p className="text-xs text-gray-400">Data shown are samples for demonstration only.</p>
            <div className="pt-2 text-sm">
              Learn more:
              {' '}
              <a className="text-brand underline" href="https://github.com/jlov7/noah-buyer-studio#readme" target="_blank" rel="noreferrer">README</a>
              {' '}·{' '}
              <a className="text-brand underline" href="https://github.com/jlov7/noah-buyer-studio/blob/main/docs/QUICKSTART.md" target="_blank" rel="noreferrer">Quickstart</a>
            </div>
          </div>
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
