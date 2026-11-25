import React from 'react';
import { ShieldCheck, Award, Truck, RotateCcw } from 'lucide-react';

export const JewelleryTrustBadges: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#E7E1D7]">
      <div className="flex items-center gap-2.5 p-2.5 bg-[#FAF8F3] border border-[#E7E1D7]/70 rounded-xl">
        <ShieldCheck className="w-4 h-4 text-[#B8893D] shrink-0" />
        <div>
          <span className="text-[11px] font-bold text-[#1B1A18] block leading-tight">100% Genuine</span>
          <span className="text-[9px] text-[#6F6A62] block leading-tight">925 Sterling Silver</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-2.5 bg-[#FAF8F3] border border-[#E7E1D7]/70 rounded-xl">
        <Award className="w-4 h-4 text-[#B8893D] shrink-0" />
        <div>
          <span className="text-[11px] font-bold text-[#1B1A18] block leading-tight">Certified</span>
          <span className="text-[9px] text-[#6F6A62] block leading-tight">Authenticity Card</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-2.5 bg-[#FAF8F3] border border-[#E7E1D7]/70 rounded-xl">
        <Truck className="w-4 h-4 text-[#B8893D] shrink-0" />
        <div>
          <span className="text-[11px] font-bold text-[#1B1A18] block leading-tight">Insured Transit</span>
          <span className="text-[9px] text-[#6F6A62] block leading-tight">BlueDart Air Express</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-2.5 bg-[#FAF8F3] border border-[#E7E1D7]/70 rounded-xl">
        <RotateCcw className="w-4 h-4 text-[#B8893D] shrink-0" />
        <div>
          <span className="text-[11px] font-bold text-[#1B1A18] block leading-tight">Easy Exchange</span>
          <span className="text-[9px] text-[#6F6A62] block leading-tight">7-Day Guarantee</span>
        </div>
      </div>
    </div>
  );
};
