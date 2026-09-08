import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, CheckCircle2 } from 'lucide-react';

interface TestimonialItem {
  id: number;
  quote: string;
  author: string;
  role?: string;
  rating?: number;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    quote: "The certified Yellow Sapphire (Pukhraj) ring crafted by Guru Diamonds brought remarkable positive energy and clarity. The genuine lab authentication report and expert Vedic guidance gave me complete peace of mind.",
    author: "Rajesh K. Sharma",
    role: "Senior IT Director, Bengaluru",
    rating: 5,
  },
  {
    id: 2,
    quote: "Finding authentic, untreated gemstones with verifiable lab certifications is rare today. Guru Diamonds' transparent pricing, depth of knowledge, and custom silver ring setting made the entire experience exceptional.",
    author: "Dr. Priya Sundaram",
    role: "Consultant Physician, Chennai",
    rating: 5,
  },
  {
    id: 3,
    quote: "The handcrafted pure silver Lord Ganesha idol is an absolute masterpiece of divine silversmithing. The intricate detailing and spiritual sanctity exceeded all our expectations for our new home temple.",
    author: "Ananya Deshmukh",
    role: "Interior Architect, Mumbai",
    rating: 5,
  },
  {
    id: 4,
    quote: "We have trusted Guru Diamonds for over 8 years. From authentic 1 to 14 Mukhi Rudrakshas to custom diamond rings, their uncompromising quality, purity, and lifelong customer support remain unmatched.",
    author: "Vikramaditya Rao",
    role: "Managing Director, Hyderabad",
    rating: 5,
  },
  {
    id: 5,
    quote: "Ordered a bespoke diamond ring and silver pooja collection with Pan-India delivery to Delhi. The packaging was immaculate, accompanied by complete BIS hallmarking and accredited lab certificates.",
    author: "Sunita Aggarwal",
    role: "Chartered Accountant, New Delhi",
    rating: 5,
  },
  {
    id: 6,
    quote: "Guru Diamonds seamlessly bridges sacred Vedic tradition with modern luxury jewelry precision. Their specialists explained astrological stone cut, clarity, and origin with genuine transparency.",
    author: "Kavita & Arvind Nambiar",
    role: "Business Entrepreneurs, Kochi",
    rating: 5,
  },
  {
    id: 7,
    quote: "The customized 5 Mukhi Rudraksha mala and certified Blue Sapphire ring were crafted with utmost devotion and precision. Transparent pricing and genuine authenticity — truly the finest in India.",
    author: "Suresh V. Hegde",
    role: "Chartered Financial Analyst, Mysuru",
    rating: 5,
  },
];

export const TestimonialCarousel: React.FC = () => {
  // Start at index 3 (4th item - "Felicity Flexor" which had .scroll-start)
  const [activeIndex, setActiveIndex] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? DEFAULT_TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === DEFAULT_TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  // Autoplay functionality with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, activeIndex]);

  const activeItem = DEFAULT_TESTIMONIALS[activeIndex];

  return (
    <section className="relative w-full bg-[#FAF6EE] py-20 sm:py-24 border-t border-[#E9D9C5] overflow-hidden">
      {/* Decorative lotus background watermark */}
      <div className="absolute left-0 top-0 bottom-0 w-36 pointer-events-none opacity-20 hidden md:block">
        <svg viewBox="0 0 200 200" fill="none" stroke="#A07840" strokeWidth="1.2" className="w-full h-full">
          <circle cx="100" cy="100" r="80" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="60" />
          <path d="M100 20 C110 50 140 60 140 100 C140 140 110 150 100 180 C90 150 60 140 60 100 C60 60 90 50 100 20 Z" />
          <path d="M20 100 C50 110 60 140 100 140 C140 140 150 110 180 100 C150 90 140 60 100 60 C60 60 50 90 20 100 Z" />
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none opacity-20 hidden md:block">
        <svg viewBox="0 0 200 200" fill="none" stroke="#A07840" strokeWidth="1.2" className="w-full h-full">
          <circle cx="100" cy="100" r="80" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="60" />
          <path d="M100 20 C110 50 140 60 140 100 C140 140 110 150 100 180 C90 150 60 140 60 100 C60 60 90 50 100 20 Z" />
          <path d="M20 100 C50 110 60 140 100 140 C140 140 150 110 180 100 C150 90 140 60 100 60 C60 60 50 90 20 100 Z" />
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 sm:w-14 bg-[#B8893D]/60" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#9A622A]">
              TESTIMONIALS
            </span>
            <span className="h-[1px] w-8 sm:w-14 bg-[#B8893D]/60" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1B1A18] tracking-tight">
            What others say...
          </h2>
          <p className="text-xs sm:text-sm text-[#7A746B] leading-relaxed font-light">
            Read firsthand experiences and real impressions from our community and valued patrons.
          </p>
        </div>

        {/* Main Content Area - Equal Layout, Height and Width for all items */}
        <div 
          className="relative max-w-4xl mx-auto px-12 sm:px-20 lg:px-24 w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Decorative Quotation Mark / Colon Design */}
          <div className="absolute top-0 right-8 sm:right-16 text-[#EADECA]/60 pointer-events-none select-none">
            <Quote className="w-28 h-28 sm:w-36 sm:h-36 text-[#EADECA]/70 fill-[#EADECA]/70" />
          </div>

          {/* Fixed-dimension, equal-height inner container */}
          <div className="relative z-10 w-full min-h-[300px] sm:min-h-[260px] flex flex-col justify-between">
            
            {/* Top Row: 5 Star Ratings */}
            <div className="flex items-center gap-1.5 text-[#D4AF37] h-6">
              {[...Array(activeItem.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>

            {/* Middle Row: Quote Text (Fixed Equal Height Container for stable layout) */}
            <div className="min-h-[140px] sm:min-h-[120px] flex items-center my-auto">
              <blockquote className="w-full">
                <p className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#2D2426] leading-relaxed italic font-normal transition-all duration-300">
                  “{activeItem.quote}”
                </p>
              </blockquote>
            </div>

            {/* Bottom Row: Author / Citation Bar (Equal Height and Width across all slides) */}
            <div className="pt-4 border-t border-[#E8DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-auto sm:h-16">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#FAF0DF] border border-[#B8893D]/50 flex items-center justify-center font-serif font-bold text-base text-[#7A1822] shadow-2xs shrink-0">
                  {activeItem.author.charAt(0)}
                </div>
                <div>
                  <cite className="not-italic font-bold text-sm sm:text-base text-[#1B1A18] block">
                    — {activeItem.author}
                  </cite>
                  <div className="flex items-center gap-1.5 text-xs text-[#9A622A] mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span>{activeItem.role || 'Verified Patron'}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#9A8F85] font-mono tracking-wider uppercase font-semibold">
                {activeIndex + 1} / {DEFAULT_TESTIMONIALS.length}
              </div>
            </div>

          </div>

          {/* Left / Right Navigation Buttons (Equal Positioned and Sized) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous quote"
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-[#7A1822] border border-[#E9D9C5] text-[#7A1822] hover:text-white shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer z-20 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next quote"
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-[#7A1822] border border-[#E9D9C5] text-[#7A1822] hover:text-white shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer z-20 group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Carousel Markers Group (Pagination Dots) */}
        <div className="flex items-center justify-center gap-2.5 pt-2">
          {DEFAULT_TESTIMONIALS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-8 h-2.5 bg-[#7A1822] shadow-xs'
                    : 'w-2.5 h-2.5 bg-[#D4C3B3] hover:bg-[#A67A3E]'
                }`}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};
