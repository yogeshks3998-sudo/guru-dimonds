import React, { useState } from 'react';
import { orderApi, PublicOrderTracking } from '../services/orderApi';
import { formatDate } from '../utils/formatters';
import { Search, CheckCircle2 } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<PublicOrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setErrorMessage('Please enter an Order Number or Tracking Number');
      setSearchedOrder(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const data = await orderApi.trackOrder(query);
      setSearchedOrder(data);
    } catch (err) {
      setSearchedOrder(null);
      setErrorMessage(err instanceof Error ? err.message : 'No shipment found matching the provided reference.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2 max-w-md mx-auto">
        <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Track Your Shipment</h1>
        <p className="text-xs text-[#6F6A62]">
          Enter your Order ID (e.g. GURU-2026-8901) or Airway Bill tracking number.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Enter Order Number or AWB ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white border border-[#E7E1D7] rounded-xl px-4 py-3 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#A67C32] hover:bg-[#8e6828] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" /> {isLoading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Loading Feedback */}
      {isLoading && (
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-8 text-center text-xs text-[#6F6A62]">
          Looking up real-time shipment status...
        </div>
      )}

      {/* Error / Not Found Feedback */}
      {!isLoading && errorMessage && hasSearched && (
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-8 text-center text-xs text-[#B43C3C]">
          {errorMessage}
        </div>
      )}

      {/* Track Result */}
      {!isLoading && searchedOrder && (
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-wrap justify-between items-center border-b border-[#E7E1D7] pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Order #{searchedOrder.orderNumber}</h3>
              <p className="text-xs text-[#6F6A62]">Courier Partner: {searchedOrder.courierPartner || 'BlueDart Air Express'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6F6A62] block">Tracking ID</span>
              <span className="font-mono font-bold text-[#A67C32]">{searchedOrder.trackingNumber || 'Pending Dispatch'}</span>
            </div>
          </div>

          {/* Timeline Status */}
          <div className="space-y-6 py-4">
            <h4 className="font-serif font-bold text-sm text-[#1B1A18]">Live Shipment Timeline</h4>
            <div className="relative pl-6 border-l-2 border-[#A67C32] space-y-6">
              {searchedOrder.history?.length > 0 ? (
                searchedOrder.history.map((step: any, idx: number) => (
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
                ))
              ) : (
                <div className="text-xs text-[#6F6A62]">Order placed. Awaiting dispatch confirmation.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
