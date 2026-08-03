import React from 'react';
import { useCompareStore } from '../../stores/useCompareStore';
import { useProductStore } from '../../stores/useProductStore';
import { useCartStore } from '../../stores/useCartStore';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { calculateJewelleryPrice } from '../../utils/pricing';
import { navigateTo } from '../../utils/navigation';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { X, Scale, ShoppingBag, ShieldCheck, Trash2, ArrowRight } from 'lucide-react';

export const CompareDrawer: React.FC = () => {
  const { compareIds, drawerOpen, setDrawerOpen, removeCompare, clearCompare } = useCompareStore();
  const { products } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);
  const getRate = useMetalRateStore((s) => s.getRate);

  if (!drawerOpen) return null;

  const comparedProducts = products.filter((p) => compareIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 bg-[#281C18]/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFF9F0] w-full max-w-6xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl border border-[#E9D9C5] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#FFFFFF] border-b border-[#E9D9C5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F4E4C8] rounded-xl text-[#7A1822]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#281C18]">
                Jewellery Comparison Matrix
              </h3>
              <p className="text-xs text-[#796A65]">
                Comparing {comparedProducts.length} of 4 selected creations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {comparedProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-semibold text-[#7A1822] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-[#796A65] hover:text-[#7A1822] hover:bg-[#F4E4C8] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Content */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm font-bold text-[#281C18]">No creations currently selected for comparison.</p>
              <p className="text-xs text-[#796A65]">
                Click the comparison icon on any product card or detail page to compare parameters.
              </p>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  navigateTo('/shop');
                }}
                className="mt-2 px-6 py-2 bg-[#7A1822] text-[#FFF9F0] text-xs font-bold rounded-xl uppercase tracking-wider shadow-md"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="min-w-[700px] divide-y divide-[#E9D9C5]">
              {/* Product Header Row */}
              <div className="grid grid-cols-5 gap-4 pb-4 items-end">
                <div className="text-xs font-bold uppercase tracking-wider text-[#796A65] self-center">
                  Creation Detail
                </div>
                {comparedProducts.map((p) => {
                  const rate = getRate(p.metalType, p.metalPurity);
                  const breakdown = calculateJewelleryPrice({
                    pricingMode: p.pricingMode,
                    fixedPrice: p.fixedPrice,
                    metalType: p.metalType,
                    purity: p.metalPurity,
                    netWeightGrams: p.netWeightGrams,
                    ratePerGram: rate,
                    makingChargeType: p.makingChargeType,
                    makingChargeValue: p.makingChargeValue,
                    wastagePercentage: p.wastagePercentage,
                    gemstones: p.gemstones,
                    certificationCharge: p.certificationCharge,
                    packagingCharge: p.packagingCharge,
                    gstPercentage: p.gstPercentage,
                  });

                  return (
                    <div key={p.id} className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#E9D9C5] relative text-center space-y-2 group">
                      <button
                        onClick={() => removeCompare(p.id)}
                        className="absolute top-2 right-2 p-1 text-[#796A65] hover:text-[#7A1822] rounded-full bg-[#FFF9F0]"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <ImageWithFallback
                        src={p.images[0]}
                        alt={p.name}
                        className="w-24 h-24 object-cover rounded-xl mx-auto bg-[#FFF9F0]"
                      />
                      <h4 className="text-xs font-bold text-[#281C18] line-clamp-1">{p.name}</h4>
                      <p className="text-sm font-extrabold text-[#7A1822]">
                        ₹{breakdown.finalPrice.toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => {
                          addItem({ product: p });
                          setDrawerOpen(false);
                        }}
                        className="w-full py-1.5 bg-[#7A1822] hover:bg-[#4D1017] text-[#FFF9F0] text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3 text-[#B8893D]" /> Add to Bag
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Rows Comparison Data */}
              <div className="grid grid-cols-5 gap-4 py-3 text-xs">
                <div className="font-bold text-[#796A65]">Metal & Purity</div>
                {comparedProducts.map((p) => (
                  <div key={p.id} className="text-[#281C18] font-semibold">
                    {p.metalPurity} {p.metalType}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 text-xs">
                <div className="font-bold text-[#796A65]">Net Weight (Grams)</div>
                {comparedProducts.map((p) => (
                  <div key={p.id} className="text-[#281C18]">
                    {p.netWeightGrams} g
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 text-xs">
                <div className="font-bold text-[#796A65]">Gross Weight (Grams)</div>
                {comparedProducts.map((p) => (
                  <div key={p.id} className="text-[#281C18]">
                    {p.grossWeightGrams} g
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 text-xs">
                <div className="font-bold text-[#796A65]">Gemstones</div>
                {comparedProducts.map((p) => (
                  <div key={p.id} className="text-[#281C18]">
                    {p.gemstones.length > 0
                      ? p.gemstones.map((g) => `${g.type} (${g.weightCaratOrGrams} ct/g)`).join(', ')
                      : 'None'}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 text-xs">
                <div className="font-bold text-[#796A65]">Making Charges</div>
                {comparedProducts.map((p) => (
                  <div key={p.id} className="text-[#281C18]">
                    {p.makingChargeType === 'FIXED'
                      ? `₹${p.makingChargeValue}`
                      : p.makingChargeType === 'PERCENTAGE'
                      ? `${p.makingChargeValue}% of Metal Value`
                      : `₹${p.makingChargeValue}/gram`}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 text-xs">
                <div className="font-bold text-[#796A65]">Certification</div>
                {comparedProducts.map((p) => (
                  <div key={p.id} className="text-[#2E7D5B] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {p.certificationAgency}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 text-xs">
                <div className="font-bold text-[#796A65]">Return Policy</div>
                {comparedProducts.map((p) => (
                  <div key={p.id} className="text-[#281C18]">
                    {p.returnEligible ? `${p.returnPolicyDays || 15}-Day Exchange / Return` : 'Non-Returnable Custom Piece'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4E4C8]/40 border-t border-[#E9D9C5] flex items-center justify-between text-xs text-[#796A65]">
          <span>All prices are live rate-linked and inclusive of 3% GST.</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="px-5 py-1.5 bg-[#281C18] text-[#FFF9F0] text-xs font-bold rounded-xl"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
