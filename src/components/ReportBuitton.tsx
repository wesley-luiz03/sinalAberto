'use client';

import React from 'react';
import { AlertTriangle, TrafficCone, Siren } from 'lucide-react';
import { ReportCategory } from '@/types';

interface ReportButtonProps {
  category: ReportCategory;
  title: string;
  subtitle: string;
  color: 'amber' | 'orange' | 'red';
  onClick: (cat: ReportCategory) => void;
  disabled?: boolean;
}

export function ReportButton({
  category,
  title,
  subtitle,
  color,
  onClick,
  disabled = false,
}: ReportButtonProps) {
  const colorStyles = {
    amber: 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-500',
    red: 'bg-red-600 hover:bg-red-700 text-white border-red-500 animate-pulse',
  };

  const icons = {
    TRAVADO: <TrafficCone className="w-10 h-10 mb-1" />,
    TRANSVERSAL_VAZIA: <AlertTriangle className="w-10 h-10 mb-1" />,
    BLOQUEANDO_EMERGENCIA: <Siren className="w-10 h-10 mb-1" />,
  };

  return (
    <button
      onClick={() => onClick(category)}
      disabled={disabled}
      className={`w-full py-6 px-4 rounded-2xl font-bold border-2 transition-all transform active:scale-95 shadow-xl flex flex-col items-center justify-center text-center disabled:opacity-50 disabled:pointer-events-none ${colorStyles[color]}`}
    >
      {icons[category]}
      <span className="text-xl tracking-wide uppercase">{title}</span>
      <span className="text-xs opacity-90 font-normal mt-1">{subtitle}</span>
    </button>
  );
}