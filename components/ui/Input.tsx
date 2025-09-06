import React from 'react';

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={["input", props.className ?? ''].join(' ')} />
);

export default Input;

