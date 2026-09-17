import React, { useState } from 'react';
import { useCMSStore } from '../../stores/useCMSStore';

export const WhatsAppButton: React.FC = () => {
  const { cms } = useCMSStore();
  const [isHovered, setIsHovered] = useState(false);

  // Retrieve dynamic WhatsApp number or fall back to default
  const rawNumber = cms.footer?.whatsapp || '+91 78991 25449';
  // Strip non-numeric characters for the wa.me link
  const cleanNumber = rawNumber.replace(/\D/g, '') || '917899125449';

  const defaultMessage = encodeURIComponent(
    'Hello Guru Diamonds, I would like to inquire about your certified gemstones and jewellery collection.'
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <div 
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip / Label */}
      <div 
        className={`mr-3 px-3.5 py-1.5 rounded-full bg-[#1B1A18]/90 text-white text-xs font-semibold tracking-wide shadow-lg border border-[#D4AF37]/40 transition-all duration-300 pointer-events-none hidden sm:flex items-center gap-1.5 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>Chat with us on WhatsApp</span>
      </div>

      {/* Main WhatsApp Circular Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Guru Diamonds on WhatsApp"
        className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.65)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Radar / Ping Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10 pointer-events-none" />

        {/* Real Official WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2a13.9 13.9 0 0 0-12 21L2 30l7.2-1.9A13.9 13.9 0 1 0 16 2zm0 25.5a11.6 11.6 0 0 1-5.9-1.6l-.4-.3-4.4 1.1 1.2-4.3-.3-.4A11.6 11.6 0 1 1 16 27.5zm6.4-8.7c-.3-.2-2-.9-2.3-1-.3-.2-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1a9.2 9.2 0 0 1-2.7-1.7 10.2 10.2 0 0 1-1.9-2.3c-.2-.3 0-.5.2-.7.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.5c.2.2 2.4 3.7 5.8 5.1.8.4 1.4.6 1.9.8.8.2 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.5z" />
        </svg>
      </a>
    </div>
  );
};
