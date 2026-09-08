import React from 'react';
import { ArrowRight, Gem, Users, ShieldCheck, FileText, Landmark, Leaf, Sun, Sparkles } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import { ContactPage } from './ContactPage';

export { ContactPage };

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAF6EE] min-h-screen text-[#2D2426]">
      {/* 1. Page Hero / Header Banner with enhanced readability overlay */}
      <section className="relative w-full bg-[#FAF5EC] bg-[url('/about-hero-bg.png')] bg-cover bg-center py-16 sm:py-20 lg:py-24 border-b border-[#E8DDCF] overflow-hidden">
        {/* Semi-transparent luxury warm ivory overlay to make all text 100% visible & readable */}
        <div className="absolute inset-0 bg-[#FAF5EC]/75 sm:bg-[#FAF5EC]/70 backdrop-blur-[1px] pointer-events-none" />

        {/* Top-Left Delicate Lotus Mandala Watermark */}
        <div className="absolute -left-12 -top-12 w-64 h-64 pointer-events-none opacity-20 hidden md:block">
          <svg viewBox="0 0 200 200" fill="none" stroke="#A07840" strokeWidth="1.2" className="w-full h-full">
            <circle cx="100" cy="100" r="80" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            <path d="M100 20 C110 50 140 60 140 100 C140 140 110 150 100 180 C90 150 60 140 60 100 C60 60 90 50 100 20 Z" />
            <path d="M20 100 C50 110 60 140 100 140 C140 140 150 110 180 100 C150 90 140 60 100 60 C60 60 50 90 20 100 Z" />
            <path d="M43 43 C70 60 75 90 100 100 C125 110 155 115 157 157 C130 140 125 110 100 100 C75 90 45 85 43 43 Z" />
            <path d="M157 43 C130 60 125 90 100 100 C75 110 45 115 43 157 C70 140 75 110 100 100 C125 90 155 85 157 43 Z" />
          </svg>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3.5 relative z-10">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-10 sm:w-16 bg-[#9A622A]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#7A4515]">
              TRUSTED HERITAGE SINCE 2000
            </span>
            <span className="h-[1.5px] w-10 sm:w-16 bg-[#9A622A]" />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#520B16] tracking-tight uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            ABOUT GURU DIAMONDS
          </h1>

          <p className="text-xs sm:text-[13.5px] font-bold tracking-[0.24em] text-[#1B1A18] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            AUTHENTIC GEMS. TIMELESS CRAFTSMANSHIP. A BRIGHTER TOMORROW.
          </p>

          <p className="text-xs sm:text-sm text-[#2E2824] font-medium leading-relaxed max-w-2xl mx-auto pt-1.5">
            For over two decades, Guru Diamonds has stood as a beacon of uncompromising authenticity, precision craftsmanship, and spiritual jewellery with a purpose.
          </p>
        </div>
      </section>

      {/* 2. Our Journey Section ("A Legacy Built on Trust and Authenticity") */}
      <section className="relative w-full bg-[#FAF5EC] py-16 sm:py-20 lg:py-24 border-b border-[#E9D9C5] overflow-hidden">
        
        {/* Ambient Subtle Background Watermark on Bottom Left */}
        <div className="absolute -bottom-10 -left-10 w-80 h-80 pointer-events-none opacity-20 text-[#C5A880]">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.85" className="w-full h-full">
            <path d="M100 20 C105 50 120 70 140 85 C160 70 175 50 180 20 C160 45 130 55 100 20 Z" />
            <path d="M100 20 C95 50 80 70 60 85 C40 70 25 50 20 20 C40 45 70 55 100 20 Z" />
            <path d="M100 60 C120 85 145 110 180 120 C155 135 125 130 100 160 C75 130 45 135 20 120 C55 110 80 85 100 60 Z" />
            <circle cx="100" cy="110" r="30" strokeDasharray="2 3" />
          </svg>
        </div>

        <div className="max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Story Content & Heritage Pillars */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Eyebrow & Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.28em] text-[#9A622A]">
                    OUR JOURNEY
                  </span>
                  <span className="h-[1px] w-14 sm:w-20 bg-[#B8893D]/60" />
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1B1613] leading-[1.14] tracking-tight uppercase">
                  A LEGACY BUILT ON<br />TRUST AND AUTHENTICITY
                </h2>
                <p className="text-xs sm:text-sm font-bold tracking-[0.24em] text-[#9A622A] uppercase font-sans pt-1">
                  CRAFTING SACRED ELEGANCE SINCE 2000
                </p>
              </div>

              {/* Story Paragraphs */}
              <div className="space-y-3.5 text-xs sm:text-sm lg:text-[14px] text-[#554E48] leading-relaxed font-sans font-normal">
                <p>
                  Established in 2000, Guru Diamonds was founded with a simple conviction – to bring genuine, astrological, and spiritually significant gemstones and silver jewellery to discerning individuals across India and worldwide.
                </p>
                <p>
                  We specialize in hand-selected certified natural gemstones, precious stones, semi-precious stones, Rudraksha (1 to 24 Mukhi), custom malas, and divine silver idols. Every piece undergoes rigorous authentication and quality checks before it reaches you.
                </p>
                <p className="text-[#6F6760]">
                  Whether you are here for a gemstone, the ideal astrological combination, a bespoke jewellery design, or a sacred idol, our team provides expert guidance and a seamless experience with complete peace of mind.
                </p>
              </div>

              {/* 3 Pillars in a row with Dividers */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#E8D9C8]">
                
                {/* Pillar 1 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 flex-1 group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E1] border border-[#E2CEB8] flex items-center justify-center text-[#9A622A] shadow-2xs group-hover:scale-110 transition-transform">
                    <Gem className="w-5 h-5 text-[#9A622A]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#281C18] leading-tight">
                    GENUINE<br />GEMSTONES
                  </span>
                </div>

                <div className="h-9 w-[1px] bg-[#E2D2C1]" />

                {/* Pillar 2 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 flex-1 group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E1] border border-[#E2CEB8] flex items-center justify-center text-[#9A622A] shadow-2xs group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-[#9A622A]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#281C18] leading-tight">
                    EXPERT<br />GUIDANCE
                  </span>
                </div>

                <div className="h-9 w-[1px] bg-[#E2D2C1]" />

                {/* Pillar 3 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 flex-1 group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E1] border border-[#E2CEB8] flex items-center justify-center text-[#9A622A] shadow-2xs group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-[#9A622A]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#281C18] leading-tight">
                    TRUSTED<br />SINCE 2000
                  </span>
                </div>

              </div>
            </div>

            {/* Right Column: High-Res Composite Visual */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <img
                src="/about-journey-visual.png"
                alt="Guru Diamonds Master Artisan Gemstone Setting Workshop"
                className="w-full h-auto object-contain"
              />
            </div>

          </div>
        </div>
      </section>

      {/* 3. Our Principles / Philosophy & Values Section */}
      <section className="relative w-full bg-[#FAF5EC] py-18 sm:py-24 border-b border-[#E9D9C5] overflow-hidden">
        
        {/* Soft Background Art Watermark */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 pointer-events-none opacity-15 text-[#C5A880]">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-full h-full">
            <path d="M100 20 C105 50 120 70 140 85 C160 70 175 50 180 20 C160 45 130 55 100 20 Z" />
            <path d="M100 20 C95 50 80 70 60 85 C40 70 25 50 20 20 C40 45 70 55 100 20 Z" />
            <path d="M100 60 C120 85 145 110 180 120 C155 135 125 130 100 160 C75 130 45 135 20 120 C55 110 80 85 100 60 Z" />
            <circle cx="100" cy="110" r="30" strokeDasharray="2 3" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          {/* Section Header */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1px] w-10 sm:w-14 bg-[#B8893D]/70" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-[#9A622A]">
                OUR PRINCIPLES
              </span>
              <span className="h-[1px] w-10 sm:w-14 bg-[#B8893D]/70" />
            </div>
            
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3B0910] uppercase tracking-tight">
              OUR PHILOSOPHY &amp; VALUES
            </h2>
            
            <p className="text-xs sm:text-[13px] text-[#796A65] font-normal leading-relaxed">
              Guided by authenticity. Rooted in tradition. Committed to a brighter you.
            </p>
          </div>

          {/* Cards Grid with Center Decorative Divider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch relative">
            
            {/* Left Card: Core Philosophy */}
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EC] backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#E5D7C5] p-6 sm:p-7 lg:p-8 shadow-sm hover:shadow-md hover:border-[#D8BE9B] transition-all flex flex-col justify-between space-y-5">
              
              {/* Card Header with Gold Accent - Center Aligned */}
              <div className="space-y-1 border-b border-[#EFE5D6] pb-3.5 text-center">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1714] tracking-tight uppercase">
                  CORE PHILOSOPHY
                </h3>
                <p className="text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.22em] text-[#9A622A] uppercase font-sans">
                  QUALITY &bull; TRANSPARENCY &bull; WELL-BEING
                </p>
              </div>

              {/* 4 Feature Items with Divider Lines */}
              <div className="space-y-4">
                
                {/* Item 1 */}
                <div className="flex items-start gap-3.5 pb-3.5 border-b border-[#F2E8DC]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <Gem className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Authenticity First
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Every gemstone &amp; silver piece is carefully verified for color, clarity, cut, and origin.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3.5 pb-3.5 border-b border-[#F2E8DC]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <FileText className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Transparent Pricing
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Clear pricing with no hidden charges.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3.5 pb-3.5 border-b border-[#F2E8DC]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Certified Excellence
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Authentic products, certified by reputed labs.
                    </p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 text-[#9A622A]">
                      <path d="M12 3c-1.2 3-3.2 5.5-6.5 7 3 1.2 6 1 6.5-0.8 0.5 1.8 3.5 2 6.5 0.8-3.3-1.5-5.3-4-6.5-7z" />
                      <path d="M12 9.5c-2 3.2-4.8 5-9 5.5 3 2 6 1.8 9-0.3 3 2.1 6 2.3 9 0.3-4.2-0.5-7-2.3-9-5.5z" />
                      <path d="M12 15c-1.5 1.8-3.5 2.8-6 2.8 1.8 1.2 4 1.2 6 0.3 2 0.9 4.2 0.9 6-0.3-2.5 0-4.5-1-6-2.8z" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Purposeful Guidance
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Helping you find the right gemstones and jewellery for well-being and prosperity.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Center Decorative Divider Ornament (Desktop only) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center gap-1.5 pointer-events-none">
              <div className="h-14 w-[1px] bg-[#D4C3AF]" />
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D4AF37]/60 flex items-center justify-center text-[#9A622A] shadow-xs">
                <svg className="w-3.5 h-3.5 text-[#9A622A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4c-1.5 3-4 6-8 7 3.5 1.5 7 1.5 8-1 1 2.5 4.5 2.5 8 1-4-1-6.5-4-8-7z" />
                  <path d="M12 10c-2 3.5-5 5.5-9 6 3 2 6 2 9-0.5 3 2.5 6 2.5 9 0.5-4-0.5-7-2.5-9-6z" />
                </svg>
              </div>
              <div className="h-14 w-[1px] bg-[#D4C3AF]" />
            </div>

            {/* Right Card: Our Values */}
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EC] backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#E5D7C5] p-6 sm:p-7 lg:p-8 shadow-sm hover:shadow-md hover:border-[#D8BE9B] transition-all flex flex-col justify-between space-y-5">
              
              {/* Card Header with Gold Accent - Center Aligned */}
              <div className="space-y-1 border-b border-[#EFE5D6] pb-3.5 text-center">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1714] tracking-tight uppercase">
                  OUR VALUES
                </h3>
                <p className="text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.22em] text-[#9A622A] uppercase font-sans">
                  TRUST &bull; TRADITION &bull; PURPOSE &bull; PEOPLE
                </p>
              </div>

              {/* 4 Feature Items with Divider Lines */}
              <div className="space-y-4">
                
                {/* Item 1 */}
                <div className="flex items-start gap-3.5 pb-3.5 border-b border-[#F2E8DC]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <Users className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Customer Trust
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Building lifelong relationships through honesty and reliability.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3.5 pb-3.5 border-b border-[#F2E8DC]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <Landmark className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Traditional Craftsmanship
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Preserving India&apos;s rich jewellery and spiritual heritage.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3.5 pb-3.5 border-b border-[#F2E8DC]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <Leaf className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Ethical Sourcing
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Responsibly sourced gemstones and precious materials.
                    </p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FAF0E1] to-[#F3E2CC] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A] shadow-2xs shrink-0 mt-0.5">
                    <Sun className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1714]">
                      Spiritual Integrity
                    </h4>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Products crafted with devotion, meaning, and authenticity.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. 4-Column Statistics Row with Vertical Dividers */}
      <section className="bg-[#F4EDE1] py-10 sm:py-12 border-y border-[#E6D9C8]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y sm:divide-y-0 md:divide-x divide-[#E0D0BE] text-center">
            
            {/* Stat 1: 5000+ Happy Customers */}
            <div className="px-4 flex flex-col items-center space-y-1.5 group">
              <div className="text-[#A6783A] mb-1">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#59121E] tracking-tight">
                5000+
              </span>
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#4E4640]">
                HAPPY CUSTOMERS
              </span>
            </div>

            {/* Stat 2: 100% Certified Gemstones */}
            <div className="px-4 pt-5 sm:pt-0 flex flex-col items-center space-y-1.5 group">
              <div className="text-[#A6783A] mb-1">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M11 3 8 9l4 12 4-12-3-6" />
                  <path d="M2 9h20" />
                </svg>
              </div>
              <span className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#59121E] tracking-tight">
                100%
              </span>
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#4E4640]">
                CERTIFIED GEMSTONES
              </span>
            </div>

            {/* Stat 3: 25+ Years of Expertise */}
            <div className="px-4 pt-5 md:pt-0 flex flex-col items-center space-y-1.5 group">
              <div className="text-[#A6783A] mb-1">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#59121E] tracking-tight">
                25+
              </span>
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#4E4640]">
                YEARS OF EXPERTISE
              </span>
            </div>

            {/* Stat 4: Pan India Secure Delivery */}
            <div className="px-4 pt-5 md:pt-0 flex flex-col items-center space-y-1.5 group">
              <div className="text-[#A6783A] mb-1">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
              </div>
              <span className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#59121E] tracking-tight">
                PAN INDIA
              </span>
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#4E4640]">
                SECURE DELIVERY
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 5. More Than Jewellery ("A Meaningful Connection") Section */}
      <section className="relative py-14 sm:py-18 lg:py-20 overflow-hidden">
        {/* Decorative Bottom-Right Watermark */}
        <div className="absolute -right-12 -bottom-12 w-72 h-72 pointer-events-none opacity-20 hidden lg:block">
          <svg viewBox="0 0 200 200" fill="none" stroke="#A07840" strokeWidth="1.2" className="w-full h-full">
            <circle cx="100" cy="100" r="80" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            <path d="M100 20 C110 50 140 60 140 100 C140 140 110 150 100 180 C90 150 60 140 60 100 C60 60 90 50 100 20 Z" />
            <path d="M20 100 C50 110 60 140 100 140 C140 140 150 110 180 100 C150 90 140 60 100 60 C60 60 50 90 20 100 Z" />
          </svg>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Silversmith Deity Handcrafting Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[1.28/1] group bg-[#1A1416]">
                <img
                  src="/about-artisan-silver-idol.jpg"
                  alt="Master Silversmith Handcrafting Pure Silver Ganesha Idol"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right Column: Text & CTA */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#9B682D] block">
                  MORE THAN JEWELLERY
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl lg:text-[40px] font-bold text-[#59121E] leading-[1.18] tracking-tight">
                  A Meaningful Connection
                </h2>
              </div>

              <p className="text-xs sm:text-[13.5px] text-[#4E4640] leading-relaxed font-sans">
                At Guru Diamonds, we believe jewellery is more than an ornament. It is a bridge between tradition, spirituality, and a better tomorrow. Our mission is to help you find pieces that bring positivity, prosperity, and peace into your life.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('/contact')}
                  className="px-7 py-3 rounded-md bg-[#54101E] hover:bg-[#6D1527] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>CONTACT US</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export const SizeGuidePage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
    <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Ring & Chain Size Guide</h1>
    <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 text-xs">
      <h3 className="font-bold text-sm text-[#A67C32]">Indian Ring Size Chart (Inner Diameter)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 bg-[#FAF8F3] rounded-xl text-center"><strong>Size 10</strong>: 15.7 mm</div>
        <div className="p-3 bg-[#FAF8F3] rounded-xl text-center"><strong>Size 12</strong>: 16.5 mm</div>
        <div className="p-3 bg-[#FAF8F3] rounded-xl text-center"><strong>Size 14</strong>: 17.3 mm</div>
        <div className="p-3 bg-[#FAF8F3] rounded-xl text-center"><strong>Size 16</strong>: 18.1 mm</div>
      </div>
    </div>
  </div>
);

export const PolicyPage: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
    <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">{title}</h1>
    <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 text-xs sm:text-sm text-[#1B1A18] leading-relaxed space-y-4">
      <p>{content}</p>
    </div>
  </div>
);

const StaticContentPage: React.FC<{ page: string; title?: string; content?: string }> = ({ page, title = '', content = '' }) => {
  if (page === 'about') return <AboutPage />;
  if (page === 'contact') return <ContactPage />;
  if (page === 'size-guide') return <SizeGuidePage />;
  return <PolicyPage title={title} content={content} />;
};

export default StaticContentPage;
