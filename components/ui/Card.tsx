import React from 'react';

export const Card = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={["card", className].join(' ')} />
);

export default Card;

