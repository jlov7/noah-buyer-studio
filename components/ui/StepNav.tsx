"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const steps = [
  { href: '/', label: 'Intake' },
  { href: '/map', label: 'Map' },
  { href: '/tour', label: 'Tour' },
];

export default function StepNav() {
  const pathname = usePathname();
  const activeIndex = steps.findIndex((s) => pathname === s.href || pathname.startsWith(s.href + '/'));

  return (
    <div className="mb-4 step-nav">
      <ol className="flex items-center justify-between">
        {steps.map((s, i) => {
          const active = i === activeIndex;
          const completed = i < activeIndex;
          return (
            <li key={s.href} className="flex-1">
              <Link href={s.href as any} className="flex items-center gap-2">
                <span
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold',
                    completed ? 'bg-brand border-brand text-white' : active ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-gray-300',
                  ].join(' ')}
                  aria-current={active ? 'step' : undefined}
                >
                  {i + 1}
                </span>
                <span className={active ? 'text-white' : 'text-gray-300'}>{s.label}</span>
              </Link>
              {i < steps.length - 1 && (
                <div className={['mx-3 h-1 rounded-full', completed ? 'bg-brand' : 'bg-white/10'].join(' ')} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
