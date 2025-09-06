"use client";
import { useEffect, useState } from 'react';

export default function DemoDisclaimerBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem('nbs:demoDisclaimer');
    if (!dismissed) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-14 z-50">
      <div className="container">
        <div className="rounded-xl border border-white/10 bg-black/85 p-3 text-sm text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              This is an illustrative demo for discussion only. Not affiliated with any brokerage.
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn bg-white/10 hover:bg-white/20"
                onClick={() => {
                  try {
                    window.dispatchEvent(new Event('open-about'));
                  } catch {}
                }}
              >
                Learn more
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('nbs:demoDisclaimer', '1');
                  }
                  setShow(false);
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

