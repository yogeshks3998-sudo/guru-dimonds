import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear after scrolling down roughly ~2 sections (approx. 450px)
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={`fixed bottom-24 right-7 z-40 flex items-center transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip on hover */}
      <div
        className={`mr-2.5 px-3 py-1 rounded-full bg-[#1B1A18]/90 text-white text-[11px] font-semibold tracking-wide shadow-md border border-[#D4AF37]/30 transition-all duration-200 pointer-events-none hidden sm:block ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span>Back to Top</span>
      </div>

      {/* Main Scroll to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#5E0D17] hover:bg-[#7A1822] text-[#E8C589] hover:text-white border border-[#D4AF37]/60 shadow-[0_4px_16px_rgba(94,13,23,0.4)] hover:shadow-[0_6px_22px_rgba(122,24,34,0.6)] hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer group"
      >
        <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#E8C589] group-hover:text-white group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};
