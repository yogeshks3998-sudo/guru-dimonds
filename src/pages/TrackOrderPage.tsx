import React, { useState } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import { formatINR, formatDate } from '../utils/formatters';
import { Search, Truck, CheckCircle2, Package, ShieldCheck } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { orders } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(orders[0] || null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === searchQuery.trim().toLowerCase() ||
        o.trackingNumber?.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    setSearchedOrder(found || null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2 max-w-md mx-auto">
        <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Track Your Shipment</h1>
        <p className="text-xs text-[#6F6A62]">
          Enter your Order ID (e.g. VED-2026-8901) or Airway Bill tracking number.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Enter Order Number (VED-2026-8901)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white border border-[#E7E1D7] rounded-xl px-4 py-3 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Track
        </button>
      </form>

      {/* Track Result */}
      {searchedOrder && (
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-wrap justify-between items-center border-b border-[#E7E1D7] pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Order #{searchedOrder.orderNumber}</h3>
              <p className="text-xs text-[#6F6A62]">Courier Partner: {searchedOrder.courierPartner || 'BlueDart Air Express'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6F6A62] block">Tracking ID</span>
              <span className="font-mono font-bold text-[#A67C32]">{searchedOrder.trackingNumber || 'BLUEDART-891230491'}</span>
            </div>
          </div>

          {/* Timeline Status */}
          <div className="space-y-6 py-4">
            <h4 className="font-serif font-bold text-sm text-[#1B1A18]">Live Shipment Timeline</h4>
            <div className="relative pl-6 border-l-2 border-[#A67C32] space-y-6">
              {searchedOrder.history?.map((step: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#A67C32] text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#1B1A18] uppercase">{step.status}</h5>
                    <p className="text-xs text-[#6F6A62] mt-0.5">{step.note}</p>
                    <span className="text-[10px] text-[#A67C32] block mt-0.5">{formatDate(step.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
