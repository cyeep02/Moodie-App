import React from 'react';
import { cn } from '../../lib/utils';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ 
  children, className, variant = 'primary', ...props 
}) => {
  const variants = {
    primary: "bg-[#FF8095] text-white hover:bg-[#ff6b83] active:bg-[#f25c74] shadow-md transition-all",
    secondary: "bg-[#B0E0E6] text-[#4682B4] hover:bg-[#a0d0d6]",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100"
  };

  return (
    <button 
      className={cn(
        "px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95 disabled:grayscale disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bg-white rounded-3xl p-6 shadow-sm border border-gray-50", className)}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input 
    className={cn(
      "w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#FF8095] transition-all outline-none text-gray-700",
      className
    )}
    {...props}
  />
);
