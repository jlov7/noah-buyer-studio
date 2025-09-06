import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function Section({ title, subtitle, children, className = '' }: Props) {
  return (
    <section className={["card", className].join(' ')}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-300">{subtitle}</p>}
      {children && <div className="mt-3">{children}</div>}
    </section>
  );
}

