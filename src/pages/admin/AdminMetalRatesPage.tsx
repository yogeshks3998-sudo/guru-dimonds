import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { useProductStore } from '../../stores/useProductStore';
import { MetalType, MetalPurity } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { calculateJewelleryPrice } from '../../utils/pricing';
import { useToast } from '../../components/ui/Toast';
import { Coins, RefreshCw, Save, ArrowUpRight, ArrowDownRight, Sparkles, AlertCircle } from 'lucide-react';

export const AdminMetalRatesPage: React.FC = () => {
  const { rates, publishNewRate } = useMetalRateStore();
  const { products } = useProductStore();
  const { showToast } = useToast();

  const [localRates, setLocalRates] = useState(rates);
  const [percentageAdjustment, setPercentageAdjustment] = useState<number>(0);

  const handleRateChange = (metal: MetalType, purity: MetalPurity, newRate: number) => {
    setLocalRates((prev) =>
      prev.map((r) => (r.metal === metal && r.purity === purity ? { ...r, ratePerGram: newRate } : r))
    );
  };

  const handleApplyPercentage = (percent: number) => {
    setPercentageAdjustment(percent);
    setLocalRates((prev) =>
      prev.map((r) => ({
        ...r,
        ratePerGram: Math.round(r.ratePerGram * (1 + percent / 100)),
      }))
    );
  };

  const handleSaveAll = () => {
    localRates.forEach((r) => {
      publishNewRate(r.metal, r.purity, r.ratePerGram);
    });
    showToast('Live Bullion Rates Updated', 'Catalog formula prices have been re-calculated across storefront.');
  };

  return (
    <AdminLayout activeTab="rates">
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Live Metal Rates Manager</h1>
            <p className="text-xs text-[#6F6A62]">
              Update MCX spot rates for Gold, Silver, and Platinum to dynamically shift storefront pricing.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="px-6 py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save & Publish Rates
          </button>
        </div>

        {/* Bulk Percentage Adjuster Bar */}
        <div className="bg-[#FAF3E6] border border-[#D8C29D] rounded-2xl p-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A67C32] block">
            Bulk Rate Shift Tools
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-[#1B1A18]">Quick Adjustment:</span>
            {[-2, -1, 0.5, 1, 2, 5].map((pct) => (
              <button
                key={pct}
                onClick={() => handleApplyPercentage(pct)}
                className="px-3 py-1.5 bg-white border border-[#D8C29D] hover:bg-[#A67C32] hover:text-white text-xs font-bold text-[#1B1A18] rounded-xl transition-colors"
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Rates Table */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Active Bullion Rate Card</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1B1A18]">
              <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                <tr>
                  <th className="p-3">Metal</th>
                  <th className="p-3">Purity Standard</th>
                  <th className="p-3">Purity %</th>
                  <th className="p-3">Current Rate (per gram)</th>
                  <th className="p-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]">
                {localRates.map((rate, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F3] transition-colors">
                    <td className="p-3 font-bold uppercase text-[#A67C32]">{rate.metal}</td>
                    <td className="p-3 font-semibold">{rate.purity}</td>
                    <td className="p-3 text-[#6F6A62]">
                      {rate.purity === '24K'
                        ? '99.9%'
                        : rate.purity === '22K'
                        ? '91.6%'
                        : rate.purity === '18K'
                        ? '75.0%'
                        : rate.purity === '14K'
                        ? '58.5%'
                        : rate.purity === '999'
                        ? '99.9%'
                        : '92.5%'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹</span>
                        <input
                          type="number"
                          value={rate.ratePerGram}
                          onChange={(e) =>
                            handleRateChange(rate.metal, rate.purity, Number(e.target.value))
                          }
                          className="w-32 bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2.5 py-1.5 font-bold font-mono text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                        />
                        <span className="text-[#6F6A62]">/g</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#6F6A62]">{formatDate(rate.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Formula Impact Preview */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Real-time Formula Price Impact</h3>
          <p className="text-xs text-[#6F6A62]">
            Preview how edited rates will alter storefront retail prices before publishing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.slice(0, 3).map((product) => {
              const activeRate = localRates.find(
                (r) => r.metal === product.metalType && r.purity === product.metalPurity
              )?.ratePerGram || 6830;

              const calculated = calculateJewelleryPrice({
                pricingMode: product.pricingMode,
                fixedPrice: product.fixedPrice,
                metalType: product.metalType,
                purity: product.metalPurity,
                netWeightGrams: product.netWeightGrams,
                ratePerGram: activeRate,
                makingChargeType: product.makingChargeType,
                makingChargeValue: product.makingChargeValue,
                wastagePercentage: product.wastagePercentage,
                gemstones: product.gemstones,
                certificationCharge: product.certificationCharge,
                packagingCharge: product.packagingCharge,
                gstPercentage: product.gstPercentage,
              });

              return (
                <div key={product.id} className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg bg-white" />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-serif font-bold text-xs text-[#1B1A18] line-clamp-1">{product.name}</h5>
                      <p className="text-[10px] text-[#6F6A62]">
                        {product.metalPurity} {product.metalType} • {product.netWeightGrams}g
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E7E1D7] flex justify-between items-baseline">
                    <span className="text-[11px] text-[#6F6A62]">New Retail Price:</span>
                    <span className="font-serif font-bold text-sm text-[#A67C32]">
                      {formatINR(calculated.finalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
