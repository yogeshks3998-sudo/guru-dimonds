import React from 'react';
import { ShieldCheck, Gem, Scale, CheckCircle2, Award, Sparkles } from 'lucide-react';
import type { Product } from '../../types';
import { getStoneDetails, getWarrantyText } from '../../utils/jewelleryDetails';

interface JewellerySpecsCardProps {
  product: Product;
  netWeight: number;
}

export const JewellerySpecsCard: React.FC<JewellerySpecsCardProps> = ({ product, netWeight }) => {
  const stone = getStoneDetails(product);
  const warranty = getWarrantyText(product);

  return (
    <div className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A1822] flex items-center gap-1.5 font-serif">
          <Sparkles className="w-4 h-4 text-[#B8893D]" /> Authenticity & Technical Specifications
        </span>
        <span className="text-[11px] font-bold text-[#2E7D5B] bg-[#E6F4EA] px-2.5 py-0.5 rounded-full border border-[#2E7D5B]/20 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#2E7D5B]" /> 925 Hallmark
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {/* Metal & Purity */}
        <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]/70 space-y-0.5">
          <span className="text-[10px] text-[#6F6A62] uppercase font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#B8893D]" /> Metal & Purity
          </span>
          <span className="font-bold text-[#1B1A18] block">
            {product.metalPurity || '925'} {product.metalType || 'Silver'}
          </span>
          <span className="text-[10px] text-[#2E7D5B] font-medium block">BIS Verified Hallmark</span>
        </div>

        {/* Centre Gemstone */}
        <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]/70 space-y-0.5">
          <span className="text-[10px] text-[#6F6A62] uppercase font-semibold flex items-center gap-1">
            <Gem className="w-3 h-3 text-[#B8893D]" /> Centre Stone
          </span>
          <span className="font-bold text-[#1B1A18] block truncate" title={stone.name}>
            {stone.name}
          </span>
          <span className="text-[10px] text-[#A67C32] font-semibold block">
            {stone.weight ? `${stone.weight}${stone.shape ? ` • ${stone.shape}` : ''}` : (stone.shape || 'Natural Grade')}
          </span>
        </div>

        {/* Silver Weights */}
        <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]/70 space-y-0.5">
          <span className="text-[10px] text-[#6F6A62] uppercase font-semibold flex items-center gap-1">
            <Scale className="w-3 h-3 text-[#B8893D]" /> Silver Weight
          </span>
          <span className="font-bold text-[#1B1A18] block">{netWeight}g Net Silver</span>
          <span className="text-[10px] text-[#6F6A62] block">Gross: {product.grossWeightGrams}g</span>
        </div>

        {/* Hallmark Status */}
        <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]/70 space-y-0.5">
          <span className="text-[10px] text-[#6F6A62] uppercase font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#2E7D5B]" /> Hallmark
          </span>
          <span className="font-bold text-[#1B1A18] block">925 BIS Stamped</span>
          <span className="text-[10px] text-[#6F6A62] block">Govt. Assay Standard</span>
        </div>

        {/* Certification */}
        <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]/70 space-y-0.5">
          <span className="text-[10px] text-[#6F6A62] uppercase font-semibold flex items-center gap-1">
            <Award className="w-3 h-3 text-[#B8893D]" /> Certification
          </span>
          <span className="font-bold text-[#1B1A18] block">Certified Authentic</span>
          <span className="text-[10px] text-[#6F6A62] block">Guarantee Card Included</span>
        </div>

        {/* Warranty */}
        <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]/70 space-y-0.5">
          <span className="text-[10px] text-[#6F6A62] uppercase font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#B8893D]" /> Warranty
          </span>
          <span className="font-bold text-[#1B1A18] block">{warranty}</span>
          <span className="text-[10px] text-[#2E7D5B] font-medium block">Craftsmanship Guarantee</span>
        </div>
      </div>
    </div>
  );
};
