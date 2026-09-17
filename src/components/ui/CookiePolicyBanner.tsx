import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

const COOKIE_CONSENT_KEY = 'guru_diamonds_cookie_consent';

export const CookiePolicyBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if customer has already accepted or declined
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Short delay for smooth slide-in appearance when website opens
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 pointer-events-none flex justify-center animate-in fade-in slide-in-from-bottom-6 duration-500"
    >
      <div className="pointer-events-auto w-full max-w-4xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#D8C29D] shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Icon & Text description */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FAF3E6] border border-[#D8C29D]/70 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-[#A67C32]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#1B1A18] tracking-tight">
                  Cookie & Privacy Preferences
                </h4>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2E7D5B] bg-[#E6F4EA] border border-[#2E7D5B]/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Secure
                </span>
              </div>
              <p className="text-xs text-[#5A524C] leading-relaxed">
                Guru Diamonds uses cookies and browser storage to personalize your shopping experience, remember your cart items, and provide secure checkout. Learn more in our{' '}
                <button
                  type="button"
                  onClick={() => navigateTo('/privacy-policy')}
                  className="text-[#A67C32] font-bold underline hover:text-[#8e6828] transition-colors"
                >
                  Privacy & Cookie Policy
                </button>
                .
              </p>
            </div>
          </div>

          {/* Right: Decline and Accept buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E1D7]">
            <button
              type="button"
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#D8C29D] hover:border-[#A67C32] bg-white hover:bg-[#FAF3E6] text-[#6F6A62] hover:text-[#1B1A18] text-xs font-bold transition-all shadow-2xs text-center"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-[1.02] text-center"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="hidden sm:flex p-1.5 text-[#6F6A62] hover:text-[#1B1A18] hover:bg-[#FAF3E6] rounded-lg transition-colors ml-1"
              title="Close"
              aria-label="Dismiss cookie banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
