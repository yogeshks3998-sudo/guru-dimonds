import React from 'react';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { formatINR } from '../../utils/formatters';
import { TrendingUp, Clock, ShieldCheck } from 'lucide-react';

export const RateTicker: React.FC = () => {
  const { rates } = useMetalRateStore();

  const gold24k = rates.find((r) => r.metal === 'GOLD' && r.purity === '24K')?.ratePerGram || 7450;
  const gold22k = rates.find((r) => r.metal === 'GOLD' && r.purity === '22K')?.ratePerGram || 6830;
  const gold18k = rates.find((r) => r.metal === 'GOLD' && r.purity === '18K')?.ratePerGram || 5590;
  const silver999 = rates.find((r) => r.metal === 'SILVER' && r.purity === '999')?.ratePerGram || 89;
  const silver925 = rates.find((r) => r.metal === 'SILVER' && r.purity === '925')?.ratePerGram || 82;

  return (
    <div className="w-full max-w-full bg-[#7A1822] text-[#F4E4C8] text-xs py-2 px-3 sm:px-4 overflow-hidden whitespace-nowrap border-b border-[#B8893D]/30 flex items-center justify-start lg:justify-between gap-3 sm:gap-6 select-none shadow-sm">
      <div className="min-w-0 flex items-center gap-3 sm:gap-6">
        <div className="flex shrink-0 items-center gap-1.5 font-semibold text-[#FFF9F0] uppercase tracking-widest text-[10px] sm:text-[11px]">
          <TrendingUp className="w-3.5 h-3.5 text-[#B8893D]" />
          <span className="hidden min-[390px]:inline">Spot Bullion Rates</span>
          <span className="min-[390px]:hidden">Rates</span>
        </div>

        <div className="min-w-0 flex items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-[#F4E4C8]">
          <span>
            24K Gold: <strong className="text-white font-bold">{formatINR(gold24k)}/g</strong>
          </span>
          <span className="text-[#B8893D]/50">|</span>
          <span>
            22K Gold: <strong className="text-white font-bold">{formatINR(gold22k)}/g</strong>
          </span>
          <span className="hidden sm:inline text-[#B8893D]/50">|</span>
          <span className="hidden sm:inline">
            18K Gold: <strong className="text-white font-bold">{formatINR(gold18k)}/g</strong>
          </span>
          <span className="hidden md:inline text-[#B8893D]/50">|</span>
          <span className="hidden md:inline">
            999 Silver: <strong className="text-white font-bold">{formatINR(silver999)}/g</strong>
          </span>
          <span className="hidden md:inline text-[#B8893D]/50">|</span>
          <span className="hidden md:inline">
            925 Sterling: <strong className="text-white font-bold">{formatINR(silver925)}/g</strong>
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 text-[10px] text-[#F3DDD7]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B8893D]" /> 100% BIS Hallmarked
        </span>
        <span className="text-[#B8893D]/50">|</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#B8893D]" /> Updated Live MCX Feed
        </span>
      </div>
    </div>
  );
};
