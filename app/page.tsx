"use client";
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import BrandMark from '@/components/BrandMark';

type Brief = {
  summary: string;
  priorities: string[];
  next_steps: string[];
};

export default function Page() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    budgetMin: '',
    budgetMax: '',
    beds: '3',
    baths: '2',
    neighborhoods: '',
    timeline: '3-6 months',
    mustHaves: '',
  });
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (typeof window !== 'undefined') {
      if (name === 'name') window.localStorage.setItem('nbs:intakeName', value);
      if (name === 'email') window.localStorage.setItem('nbs:intakeEmail', value);
    }
  };

  // Prefill from localStorage if available
  if (typeof window !== 'undefined' && !form.name && !form.email) {
    try {
      const name = window.localStorage.getItem('nbs:intakeName');
      const email = window.localStorage.getItem('nbs:intakeEmail');
      if (name || email) {
        setForm((f) => ({ ...f, name: name || '', email: email || '' }));
      }
    } catch {}
  }

  async function generate() {
    setError(null);
    setLoading(true);
    setBrief(null);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate brief');
      setBrief(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Section
        title="Start Here — Buyer Intake"
        subtitle="Answer a few questions (≈3 minutes). Then generate a concise Buyer Brief you can share with clients and use to guide search."
      >
        <ul className="list-disc pl-5 text-sm text-gray-200">
          <li>Brief uses GitHub Models with structured JSON output (no keys in browser)</li>
          <li>Compliant wording: neutral schools, TREC price disclosure auto-included</li>
          <li>Next: open the Map for overlays and listing selection</li>
        </ul>
      </Section>

      <Card>
        <h1 className="mb-2 text-xl font-semibold">Buyer Intake (≈3 minutes)</h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Name</span>
            <Input name="name" value={form.name} onChange={onChange} placeholder="Your name" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Email</span>
            <Input name="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Budget Min ($)</span>
            <Input name="budgetMin" value={form.budgetMin} onChange={onChange} placeholder="400000" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Budget Max ($)</span>
            <Input name="budgetMax" value={form.budgetMax} onChange={onChange} placeholder="800000" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Beds</span>
            <Input name="beds" value={form.beds} onChange={onChange} placeholder="3" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Baths</span>
            <Input name="baths" value={form.baths} onChange={onChange} placeholder="2" />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-gray-300">Neighborhoods of interest</span>
            <Input
              name="neighborhoods"
              value={form.neighborhoods}
              onChange={onChange}
              placeholder="e.g., Mueller, Zilker, Brentwood"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-300">Timeline</span>
            <Input name="timeline" value={form.timeline} onChange={onChange} placeholder="3-6 months" />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-gray-300">Must-haves</span>
            <Input name="mustHaves" value={form.mustHaves} onChange={onChange} placeholder="garage, yard, office" />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button onClick={generate} disabled={loading}>
            {loading ? 'Generating…' : 'Generate Brief'}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setForm({
                name: 'Alex and Sam Harper',
                email: 'alex@example.com',
                budgetMin: '500000',
                budgetMax: '800000',
                beds: '3',
                baths: '2',
                neighborhoods: 'Mueller, Brentwood, Zilker',
                timeline: '3-6 months',
                mustHaves: 'garage, small yard, office, walkable coffee'
              })
            }
          >
            Use sample
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </Card>

      {brief && (
        <Card className="printable">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-gray-300">Buyer Brief</div>
            <BrandMark />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Buyer Brief</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-100">{brief.summary}</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 font-medium">Priorities</div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-200">
                {brief.priorities.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 font-medium">Next steps</div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-200">
                {brief.next_steps.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm no-print">
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard?.writeText(JSON.stringify(brief, null, 2))}
            >
              Copy JSON
            </Button>
            <a className="btn" href="/map">Open Map</a>
            <Button
              variant="secondary"
              onClick={() => typeof window !== 'undefined' && window.print()}
            >
              Save as PDF
            </Button>
          </div>
          <div className="mt-4 text-xs text-gray-300">
            Schools: For objective data, see
            {' '}
            <a className="text-brand underline" href="https://txschools.gov/" target="_blank" rel="noreferrer">TXSchools</a>
            {' '}and{' '}
            <a className="text-brand underline" href="https://tea.texas.gov/texas-schools/accountability/academic-accountability/performance-reporting/">TEA</a>.
            {' '}MLS note: Before touring, many MLSs now require a written buyer agreement; broker compensation is not displayed in the MLS and is negotiated outside the MLS.
          </div>
        </Card>
      )}
    </div>
  );
}
