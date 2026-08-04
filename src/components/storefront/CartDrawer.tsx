import React, { useState, useEffect } from 'react';
import { Drawer } from '../ui/Modal';
import { useCartStore } from '../../stores/useCartStore';
import { formatINR } from '../../utils/formatters';
import { navigateTo } from '../../utils/navigation';
import { PriceBreakdownModal } from '../common/PriceBreakdownModal';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { ShoppingBag, Trash2, Tag, Gift, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    toggleGiftWrap,
    getSubtotal,
    getDiscountAmount,
    getGSTTotal,
    getShippingCharge,
    getTotal,
    priceLockExpiresAt,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedBreakdownItem, setSelectedBreakdownItem] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  useEffect(() => {
    if (!priceLockExpiresAt) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((priceLockExpiresAt - Date.now()) / 1000));
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [priceLockExpiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} title="Your Shopping Bag" position="right">
        {items.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-[#FAF3E6] border border-[#D8C29D] rounded-full flex items-center justify-center mx-auto text-[#A67C32]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="font-serif font-bold text-lg text-[#1B1A18]">Your Shopping Bag is Empty</h4>
            <p className="text-xs text-[#6F6A62] max-w-xs mx-auto">
              Explore our 100% BIS Hallmarked 22K Gold, 925 Sterling Silver, and certified Gemstone pieces.
            </p>
            <button
              onClick={() => {
                onClose();
                navigateTo('/shop');
              }}
              className="px-6 py-2.5 bg-[#A67C32] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#8e6828] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-6">
            {/* Price Lock Timer Bar */}
            <div className="bg-[#FAF3E6] border border-[#D8C29D] rounded-xl p-3 flex items-center justify-between text-xs text-[#1B1A18]">
              <div className="flex items-center gap-2 font-medium">
                <Lock className="w-4 h-4 text-[#A67C32]" />
                <span>Live Bullion Price Lock</span>
              </div>
              <span className="font-mono font-bold text-[#A67C32] bg-white px-2 py-0.5 rounded border border-[#D8C29D]">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="p-3 bg-white border border-[#E7E1D7] rounded-xl flex gap-3 relative">
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#FAF8F3] shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-6">
                    <h5 className="font-serif font-bold text-xs text-[#1B1A18] line-clamp-1">{item.product.name}</h5>
                    <p className="text-[11px] text-[#6F6A62] mt-0.5">
                      {item.product.metalPurity} {item.product.metalType} | Net Wt: {item.product.netWeightGrams}g
                    </p>
                    {item.selectedVariant && (
                      <p className="text-[10px] text-[#A67C32] font-semibold">
                        Variant: {Object.values(item.selectedAttributes).join(', ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-[#E7E1D7] rounded-lg overflow-hidden bg-[#FAF8F3] text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-[#E7E1D7] text-[#1B1A18] font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-[#E7E1D7] text-[#1B1A18] font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-sm text-[#1B1A18]">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedBreakdownItem(item)}
                      className="text-[10px] font-semibold text-[#A67C32] underline mt-1.5 block hover:text-[#8e6828]"
                    >
                      View Formula Price Breakdown
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 text-[#6F6A62] hover:text-[#B43C3C] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="space-y-2 pt-2 border-t border-[#E7E1D7]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#E6F4EA] border border-[#2E7D5B] rounded-xl text-xs text-[#2E7D5B]">
                  <span className="font-bold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Coupon Applied: {appliedCoupon.code}
                  </span>
                  <button onClick={removeCoupon} className="text-xs underline font-semibold text-[#B43C3C]">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1B1A18] text-white text-xs font-bold rounded-xl uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponMessage && (
                <p
                  className={`text-[11px] font-semibold ${
                    couponMessage.type === 'success' ? 'text-[#2E7D5B]' : 'text-[#B43C3C]'
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Order Summary & Checkout Action */}
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 space-y-2 text-xs text-[#1B1A18]">
              <div className="flex justify-between text-[#6F6A62]">
                <span>Bag Subtotal</span>
                <span>{formatINR(getSubtotal())}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-[#2E7D5B] font-medium">
                  <span>Coupon Discount</span>
                  <span>- {formatINR(getDiscountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6F6A62]">
                <span>Estimated GST (3%)</span>
                <span>{formatINR(getGSTTotal())}</span>
              </div>
              <div className="flex justify-between text-[#6F6A62]">
                <span>Insured Express Shipping</span>
                <span>{getShippingCharge() === 0 ? <strong className="text-[#2E7D5B]">FREE</strong> : formatINR(getShippingCharge())}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-2 border-t border-[#E7E1D7] text-[#1B1A18]">
                <span>Final Order Amount</span>
                <span className="text-[#A67C32]">{formatINR(getTotal())}</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigateTo('/checkout');
                }}
                className="w-full py-3.5 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-3"
              >
                <span>Proceed to Insured Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6F6A62] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D5B]" /> 100% Encrypted & Insured Transit
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Formula Breakdown Modal */}
      {selectedBreakdownItem && (
        <PriceBreakdownModal
          isOpen={!!selectedBreakdownItem}
          onClose={() => setSelectedBreakdownItem(null)}
          priceBreakdown={selectedBreakdownItem.priceBreakdown}
          productName={selectedBreakdownItem.product.name}
        />
      )}
    </>
  );
};
