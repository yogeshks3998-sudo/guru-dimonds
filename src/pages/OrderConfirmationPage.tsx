import React from 'react';
import { navigateTo } from '../utils/navigation';
import { useOrderStore } from '../stores/useOrderStore';
import { formatINR, formatDate } from '../utils/formatters';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { CheckCircle2, Package, ShieldCheck, Printer, ArrowRight, Truck } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orders } = useOrderStore();
  const latestOrder = orders[0]; // Most recent placed order

  if (!latestOrder) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">Order Confirmation</h2>
        <button
          onClick={() => navigateTo('/')}
          className="px-6 py-2.5 bg-[#A67C32] text-white text-xs font-bold uppercase rounded-xl"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-[#E7E1D7] rounded-3xl p-8 text-center space-y-4 shadow-lg">
        <div className="w-16 h-16 bg-[#E6F4EA] border border-[#2E7D5B] text-[#2E7D5B] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#A67C32] block">
          Order Successfully Confirmed
        </span>

        <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">
          Thank You For Choosing Vedaara Fine Jewellery
        </h1>

        <p className="text-xs text-[#6F6A62] max-w-md mx-auto">
          Your order number is <strong className="text-[#1B1A18]">{latestOrder.orderNumber}</strong>. A digital receipt has been sent to your registered email.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-[#FAF8F3] hover:bg-[#FAF3E6] border border-[#E7E1D7] text-[#1B1A18] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#A67C32]" /> Print Tax Invoice
          </button>

          <button
            onClick={() => navigateTo('/track-order')}
            className="px-5 py-2.5 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2"
          >
            <Truck className="w-4 h-4" /> Track Shipment Status
          </button>
        </div>
      </div>

      {/* Order Details Summary */}
      <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-[#E7E1D7] pb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1B1A18]">Order #{latestOrder.orderNumber}</h3>
            <p className="text-xs text-[#6F6A62]">Placed on {formatDate(latestOrder.placedAt)}</p>
          </div>
          <span className="text-xs font-bold text-[#2E7D5B] bg-[#E6F4EA] border border-[#2E7D5B] px-3 py-1 rounded-full uppercase">
            {latestOrder.orderStatus}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {latestOrder.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-[#E7E1D7]/50">
              <div className="flex items-center gap-3">
                <ImageWithFallback src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-lg bg-[#FAF8F3]" />
                <div>
                  <h5 className="font-bold text-[#1B1A18]">{item.productName}</h5>
                  <p className="text-[10px] text-[#6F6A62]">Quantity: {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold text-[#1B1A18]">{formatINR(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-[#E7E1D7]">
          <span>Total Paid</span>
          <span className="text-xl font-serif text-[#A67C32]">{formatINR(latestOrder.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};
