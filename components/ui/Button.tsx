"use client";
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const base = 'btn';
  const secondary = 'bg-white/10 hover:bg-white/20';
  const classes = [base, variant === 'secondary' ? secondary : '', className].join(' ').trim();
  return <button {...props} className={classes} />;
};

export default Button;

