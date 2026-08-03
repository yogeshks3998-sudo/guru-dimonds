import React, { useState } from 'react';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrderStore } from '../stores/useOrderStore';
import { formatINR } from '../utils/formatters';
import { navigateTo } from '../utils/navigation';
import { Address } from '../types';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, CreditCard, QrCode, Building, Banknote } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, getSubtotal, getDiscountAmount, getGSTTotal, getShippingCharge, getTotal, clearCart } =
    useCartStore();
  const { customer, isCustomerLoggedIn } = useAuthStore();
  const { placeOrder } = useOrderStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address State
  const [selectedAddress, setSelectedAddress] = useState<Address>(
    customer?.addresses[0] || {
      id: 'addr-default',
      fullName: customer?.name || 'Valued Customer',
      phone: customer?.phone || '+91 98200 98200',
      email: customer?.email || 'customer@vedaara.com',
      street: '402, Royal Palms, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
      isDefault: true,
      addressType: 'Home',
    }
  );

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'COD'>('UPI');
  const [gstInvoiceRequested, setGstInvoiceRequested] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-[#6F6A62]">Add items to your bag before proceeding to checkout.</p>
        <button
          onClick={() => navigateTo('/shop')}
          className="px-6 py-2.5 bg-[#A67C32] text-white text-xs font-bold uppercase rounded-xl"
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const order = placeOrder({
        customer: {
          id: customer?.id || `cust-${Date.now()}`,
          name: selectedAddress.fullName,
          email: selectedAddress.email,
          phone: selectedAddress.phone,
        },
        shippingAddress: selectedAddress,
        billingAddress: selectedAddress,
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantSku: item.selectedVariant?.sku,
          variantDetails: item.selectedAttributes,
          image: item.product.images[0],
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          priceBreakdownSnapshot: item.priceBreakdown,
          customEngraving: item.customEngraving,
        })),
        subtotal: getSubtotal(),
        discountAmount: getDiscountAmount(),
        gstTotal: getGSTTotal(),
        shippingCharge: getShippingCharge(),
        totalAmount: getTotal(),
        paymentMethod,
        notes: orderNotes,
      });

      clearCart();
      setIsProcessing(false);
      navigateTo(`/checkout/success?orderNumber=${order.orderNumber}`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Steps Progress */}
      <div className="flex items-center justify-between max-w-xl mx-auto border-b border-[#E7E1D7] pb-4 text-xs font-bold uppercase tracking-wider">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#A67C32]' : 'text-[#6F6A62]'}`}>
          <span className="w-6 h-6 rounded-full bg-[#FAF3E6] border border-[#D8C29D] flex items-center justify-center">1</span>
          <span>Address</span>
        </div>
        <div className="w-12 h-0.5 bg-[#E7E1D7]" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#A67C32]' : 'text-[#6F6A62]'}`}>
          <span className="w-6 h-6 rounded-full bg-[#FAF3E6] border border-[#D8C29D] flex items-center justify-center">2</span>
          <span>Payment</span>
        </div>
        <div className="w-12 h-0.5 bg-[#E7E1D7]" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#A67C32]' : 'text-[#6F6A62]'}`}>
          <span className="w-6 h-6 rounded-full bg-[#FAF3E6] border border-[#D8C29D] flex items-center justify-center">3</span>
          <span>Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Address Selection */}
          {step === 1 && (
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Shipping Address</h3>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#1B1A18] block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={selectedAddress.fullName}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, fullName: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#1B1A18] block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={selectedAddress.phone}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, phone: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={selectedAddress.street}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, street: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-[#1B1A18] block mb-1">City</label>
                    <input
                      type="text"
                      value={selectedAddress.city}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, city: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#1B1A18] block mb-1">State</label>
                    <input
                      type="text"
                      value={selectedAddress.state}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, state: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#1B1A18] block mb-1">Pincode</label>
                    <input
                      type="text"
                      value={selectedAddress.pincode}
                      onChange={(e) => setSelectedAddress({ ...selectedAddress, pincode: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Continue to Payment Method
              </button>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Select Payment Option</h3>
                <button onClick={() => setStep(1)} className="text-xs text-[#A67C32] font-semibold flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Address
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { id: 'UPI', label: 'Mock UPI / QR (GPay, PhonePe, Paytm)', icon: QrCode },
                  { id: 'CARD', label: 'Mock Credit / Debit Card', icon: CreditCard },
                  { id: 'NET_BANKING', label: 'Mock Net Banking (HDFC, ICICI, SBI)', icon: Building },
                  { id: 'COD', label: 'Cash on Delivery (COD Verified)', icon: Banknote },
                ].map((option) => (
                  <label
                    key={option.id}
                    onClick={() => setPaymentMethod(option.id as any)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === option.id
                        ? 'bg-[#FAF3E6] border-[#A67C32] text-[#1B1A18] font-bold'
                        : 'bg-white border-[#E7E1D7] hover:border-[#A67C32]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <option.icon className="w-5 h-5 text-[#A67C32]" />
                      <span>{option.label}</span>
                    </div>
                    <input type="radio" checked={paymentMethod === option.id} readOnly />
                  </label>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3.5 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Review Order Details
              </button>
            </div>
          )}

          {/* STEP 3: Order Review & Placement */}
          {step === 3 && (
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-4">
                <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Final Order Review</h3>
                <button onClick={() => setStep(2)} className="text-xs text-[#A67C32] font-semibold flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Payment
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#E7E1D7]">
                  <span className="font-bold text-[#1B1A18] block mb-1">Shipping To:</span>
                  <p>{selectedAddress.fullName} • {selectedAddress.phone}</p>
                  <p>{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                </div>

                <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#E7E1D7]">
                  <span className="font-bold text-[#1B1A18] block mb-1">Payment Method Selected:</span>
                  <p className="font-bold text-[#A67C32]">{paymentMethod} (Mock Payment Simulation)</p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Securing Order Snapshot...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Place Order ({formatINR(getTotal())})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Order Items Summary Sidebar */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-6 shadow-sm h-fit">
          <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-3">
            Order Items ({items.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-[#E7E1D7]/50">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <ImageWithFallback src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 object-cover rounded-lg bg-[#FAF8F3]" />
                  <div className="min-w-0">
                    <p className="font-bold text-[#1B1A18] line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-[#6F6A62]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-[#1B1A18]">{formatINR(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-[#E7E1D7]">
            <div className="flex justify-between text-[#6F6A62]">
              <span>Subtotal</span>
              <span>{formatINR(getSubtotal())}</span>
            </div>
            {getDiscountAmount() > 0 && (
              <div className="flex justify-between text-[#2E7D5B]">
                <span>Coupon Discount</span>
                <span>- {formatINR(getDiscountAmount())}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6F6A62]">
              <span>GST (3%)</span>
              <span>{formatINR(getGSTTotal())}</span>
            </div>
            <div className="flex justify-between text-[#6F6A62]">
              <span>Insured Shipping</span>
              <span>{getShippingCharge() === 0 ? 'FREE' : formatINR(getShippingCharge())}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-[#E7E1D7]">
              <span>Total Payable</span>
              <span className="text-[#A67C32]">{formatINR(getTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
