import React from 'react';

export function Price({ value }: { value: number }) {
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  return (
    <div>
      <div className="text-lg font-semibold">{usd}</div>
      <p className="mt-1 text-xs text-gray-300">
        This represents an estimated sale price for this property. It is not the same as the opinion of value in an appraisal developed by a licensed appraiser under the Uniform Standards of Professional Appraisal Practice.
      </p>
    </div>
  );
}

export default Price;

