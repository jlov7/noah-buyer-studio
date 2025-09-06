import React from 'react';

export const Badge = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={["badge", className].join(' ')} />
);

export default Badge;

