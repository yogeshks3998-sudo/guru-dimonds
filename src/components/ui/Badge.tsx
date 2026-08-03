import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'gold' | 'silver' | 'emerald' | 'ruby' | 'dark' | 'outline' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'gold', className = '' }) => {
  const variantStyles = {
    gold: 'bg-[#FAF3E6] text-[#A67C32] border-[#D8C29D]',
    silver: 'bg-[#F2F4F7] text-[#475467] border-[#D0D5DD]',
    emerald: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
    ruby: 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]',
    dark: 'bg-[#1B1A18] text-[#FAF8F3] border-[#1B1A18]',
    outline: 'bg-transparent text-[#6F6A62] border-[#E7E1D7]',
    success: 'bg-[#E6F4EA] text-[#2E7D5B] border-[#2E7D5B]',
    warning: 'bg-[#FEF3C7] text-[#B7791F] border-[#FCD34D]',
    danger: 'bg-[#FEE2E2] text-[#B43C3C] border-[#FCA5A5]',
  };

  return (
    <span
      className={`inline-flex items-center tracking-wider text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};
