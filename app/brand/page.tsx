"use client";
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import { BRAND } from '@/lib/brand';

export default function BrandPage() {
  const [primary, setPrimary] = useState(BRAND.colors.primary);
  const [dark, setDark] = useState(BRAND.colors.dark);
  const [light, setLight] = useState(BRAND.colors.light);

  useEffect(() => {
    // Load from localStorage if present
    try {
      const saved = JSON.parse(localStorage.getItem('nbs:brandColors') || 'null');
      if (saved?.primary && saved?.dark && saved?.light) {
        setPrimary(saved.primary);
        setDark(saved.dark);
        setLight(saved.light);
      }
    } catch {}
  }, []);

  function applyPreview() {
    document.body.style.setProperty('--brand-color', primary);
    document.body.style.setProperty('--brand-color-dark', dark);
    document.body.style.setProperty('--brand-color-light', light);
  }

  function saveLocal() {
    localStorage.setItem('nbs:brandColors', JSON.stringify({ primary, dark, light }));
  }

  function copySnippet() {
    const snippet = `// lib/brand.ts
export const BRAND = {
  name: '${BRAND.name}',
  website: '${BRAND.website}',
  logo: '${BRAND.logo}',
  colors: {
    primary: '${primary}',
    dark: '${dark}',
    light: '${light}',
  },
  contact: ${JSON.stringify(BRAND.contact)},
};\n`;
    navigator.clipboard.writeText(snippet);
  }

  return (
    <div className="space-y-4">
      <Section
        title="Brand Colors"
        subtitle="Fine‑tune the EpiQue palette. Preview applies instantly; copy the snippet to update lib/brand.ts for a permanent change."
      />
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Primary</span>
            <input className="input" type="text" value={primary} onChange={(e) => setPrimary(e.target.value)} placeholder="#RRGGBB" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Dark</span>
            <input className="input" type="text" value={dark} onChange={(e) => setDark(e.target.value)} placeholder="#RRGGBB" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Light</span>
            <input className="input" type="text" value={light} onChange={(e) => setLight(e.target.value)} placeholder="#RRGGBB" />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={applyPreview}>Apply preview</Button>
          <Button variant="secondary" onClick={saveLocal}>Save locally</Button>
          <Button variant="secondary" onClick={copySnippet}>Copy lib/brand.ts snippet</Button>
        </div>
      </Card>

      <Card>
        <div className="mb-2 font-medium">Preview</div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge" style={{ backgroundColor: primary }}>Primary</span>
          <span className="badge" style={{ backgroundColor: dark }}>Dark</span>
          <span className="badge" style={{ backgroundColor: light, color: '#000' }}>Light</span>
          <Button>Button</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </Card>
    </div>
  );
}

