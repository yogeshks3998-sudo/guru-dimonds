import React from 'react';
import { Modal } from '../ui/Modal';
import { PriceBreakdown } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { ShieldCheck, Info } from 'lucide-react';

interface PriceBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceBreakdown: PriceBreakdown;
  productName: string;
}

export const PriceBreakdownModal: React.FC<PriceBreakdownModalProps> = ({
  isOpen,
  onClose,
  priceBreakdown,
  productName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transparent Price Breakdown" maxWidth="lg">
      <div className="space-y-6 text-[#1B1A18]">
        {/* Header summary */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E1D7] flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-base text-[#1B1A18] line-clamp-1">{productName}</h4>
            <p className="text-xs text-[#6F6A62] mt-0.5">
              {priceBreakdown.purity} {priceBreakdown.metalType} • Net Weight: {priceBreakdown.netWeightGrams}g
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#6F6A62] uppercase block font-semibold">Final Price</span>
            <span className="text-xl font-bold text-[#A67C32]">{formatINR(priceBreakdown.finalPrice)}</span>
          </div>
        </div>

        {/* Live metal rate notification */}
        <div className="flex items-center gap-2 p-3 bg-[#FAF3E6] border border-[#D8C29D] rounded-lg text-xs text-[#1B1A18]">
          <ShieldCheck className="w-4 h-4 text-[#A67C32] shrink-0" />
          <span>
            Current Rate applied: <strong>{formatINR(priceBreakdown.ratePerGram)}/g</strong> ({priceBreakdown.purity}{' '}
            {priceBreakdown.metalType}) as of {formatDate(priceBreakdown.calculatedAt)}.
          </span>
        </div>

        {/* Breakdown table */}
        <div className="space-y-2 text-sm border-t border-b border-[#E7E1D7] py-4">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-[#6F6A62]">
              Metal Value ({priceBreakdown.netWeightGrams}g × {formatINR(priceBreakdown.ratePerGram)}/g × purity)
            </span>
            <span className="font-semibold text-[#1B1A18]">{formatINR(priceBreakdown.metalValue)}</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="text-[#6F6A62]">
              Making Charges ({priceBreakdown.makingChargeType === 'PERCENTAGE' ? `${priceBreakdown.makingChargeValue}% of Metal Value` : priceBreakdown.makingChargeType === 'PER_GRAM' ? `₹${priceBreakdown.makingChargeValue}/g` : 'Fixed'})
            </span>
            <span className="font-semibold text-[#1B1A18]">{formatINR(priceBreakdown.makingChargeTotal)}</span>
          </div>

          {priceBreakdown.wastageValue > 0 && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#6F6A62]">Wastage ({priceBreakdown.wastagePercentage}%)</span>
              <span className="font-semibold text-[#1B1A18]">{formatINR(priceBreakdown.wastageValue)}</span>
            </div>
          )}

          {priceBreakdown.gemstoneValue > 0 && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#6F6A62]">Certified Gemstones Value</span>
              <span className="font-semibold text-[#1B1A18]">{formatINR(priceBreakdown.gemstoneValue)}</span>
            </div>
          )}

          {priceBreakdown.certificationCharge > 0 && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#6F6A62]">Hallmark & Lab Certification</span>
              <span className="font-semibold text-[#1B1A18]">{formatINR(priceBreakdown.certificationCharge)}</span>
            </div>
          )}

          {priceBreakdown.packagingCharge > 0 && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#6F6A62]">Tamper-proof Velvet Box Packaging</span>
              <span className="font-semibold text-[#1B1A18]">{formatINR(priceBreakdown.packagingCharge)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-t border-dashed border-[#E7E1D7] font-medium">
            <span>Subtotal</span>
            <span>{formatINR(priceBreakdown.subtotal)}</span>
          </div>

          {priceBreakdown.discount > 0 && (
            <div className="flex justify-between items-center py-1.5 text-[#2E7D5B]">
              <span>Coupon Discount Applied</span>
              <span>- {formatINR(priceBreakdown.discount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1.5">
            <span className="text-[#6F6A62]">GST ({priceBreakdown.gstPercentage}%)</span>
            <span className="font-semibold text-[#1B1A18]">{formatINR(priceBreakdown.gstAmount)}</span>
          </div>
        </div>

        {/* Final Total */}
        <div className="flex justify-between items-center p-4 bg-[#1B1A18] text-[#FAF8F3] rounded-xl">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D8C29D]">Total Price (Incl. GST)</span>
            <h3 className="text-2xl font-serif font-bold text-white mt-0.5">{formatINR(priceBreakdown.finalPrice)}</h3>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        <p className="text-[11px] text-[#6F6A62] text-center flex items-center justify-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#A67C32]" /> Guru Diamonds guarantees transparent pricing without hidden overheads.
        </p>
      </div>
    </Modal>
  );
};
