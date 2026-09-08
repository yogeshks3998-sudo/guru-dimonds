import React, { useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Sun, Crown, Shield, Heart, Zap, Award, Flame, Eye, Compass, Phone } from 'lucide-react';
import { navigateTo } from '../../utils/navigation';
import { useProductStore } from '../../stores/useProductStore';
import { useCMSStore } from '../../stores/useCMSStore';

interface NavarathnaItem {
  id: string;
  name: string;
  vedicName: string;
  image: string;
  tagline: string;
  benefits: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
  }[];
  searchTerm: string;
}

const NAVARATHNA_GEMS: NavarathnaItem[] = [
  {
    id: 'ruby',
    name: 'RUBY',
    vedicName: 'Manik',
    image: '/gemstones/ruby.png',
    tagline: 'Stone of Leadership & Vitality',
    benefits: [
      { icon: Crown, text: 'Enhances confidence' },
      { icon: TrendingUp, text: 'Brings success and prosperity' },
      { icon: Sun, text: 'Associated with Sun energy' },
    ],
    searchTerm: 'Ruby',
  },
  {
    id: 'emerald',
    name: 'EMERALD',
    vedicName: 'Panna',
    image: '/gemstones/emerald.png',
    tagline: 'Stone of Wisdom & Intellect',
    benefits: [
      { icon: Sparkles, text: 'Enhances communication & intellect' },
      { icon: TrendingUp, text: 'Brings growth in business & trade' },
      { icon: Zap, text: 'Associated with Mercury (Budh) energy' },
    ],
    searchTerm: 'Emerald',
  },
  {
    id: 'sapphire',
    name: 'SAPPHIRE',
    vedicName: 'Neelam',
    image: '/gemstones/sapphire.png',
    tagline: 'Stone of Discipline & Fortune',
    benefits: [
      { icon: Shield, text: 'Offers protection and mental focus' },
      { icon: Award, text: 'Accelerates positive career fortune' },
      { icon: Compass, text: 'Associated with Saturn (Shani) energy' },
    ],
    searchTerm: 'Blue Sapphire',
  },
  {
    id: 'yellow-sapphire',
    name: 'YELLOW SAPPHIRE',
    vedicName: 'Pukhraj',
    image: '/gemstones/yellow-sapphire.png',
    tagline: 'Stone of Divine Knowledge & Wealth',
    benefits: [
      { icon: Crown, text: 'Brings spiritual wisdom & knowledge' },
      { icon: TrendingUp, text: 'Attracts auspicious prosperity and joy' },
      { icon: Sun, text: 'Associated with Jupiter (Guru) energy' },
    ],
    searchTerm: 'Yellow Sapphire',
  },
  {
    id: 'diamond',
    name: 'DIAMOND',
    vedicName: 'Heera',
    image: '/gemstones/diamond.png',
    tagline: 'Stone of Luxury & Grace',
    benefits: [
      { icon: Sparkles, text: 'Enhances artistic charisma & luxury' },
      { icon: Heart, text: 'Brings marital harmony & elegance' },
      { icon: Zap, text: 'Associated with Venus (Shukra) energy' },
    ],
    searchTerm: 'Diamond',
  },
  {
    id: 'coral',
    name: 'CORAL',
    vedicName: 'Moonga',
    image: '/gemstones/coral.png',
    tagline: 'Stone of Courage & Vital Power',
    benefits: [
      { icon: Flame, text: 'Boosts physical courage and stamina' },
      { icon: Shield, text: 'Overcomes obstacles and lethargy' },
      { icon: Zap, text: 'Associated with Mars (Mangal) energy' },
    ],
    searchTerm: 'Red Coral',
  },
  {
    id: 'pearl',
    name: 'PEARL',
    vedicName: 'Moti',
    image: '/gemstones/pearl.png',
    tagline: 'Stone of Inner Peace & Intuition',
    benefits: [
      { icon: Heart, text: 'Calms emotions and clears the mind' },
      { icon: Sparkles, text: 'Promotes mental serenity and purity' },
      { icon: Eye, text: 'Associated with Moon (Chandra) energy' },
    ],
    searchTerm: 'Pearl',
  },
  {
    id: 'cats-eye',
    name: "CAT'S EYE",
    vedicName: 'Lehsunia',
    image: '/gemstones/cats-eye.png',
    tagline: 'Stone of Spiritual Awakening',
    benefits: [
      { icon: Eye, text: 'Protects from hidden negative energies' },
      { icon: Shield, text: 'Enhances deep intuition and awareness' },
      { icon: Compass, text: 'Associated with Ketu energy' },
    ],
    searchTerm: "Cat's Eye",
  },
  {
    id: 'hessonite',
    name: 'HESSONITE',
    vedicName: 'Gomed',
    image: '/gemstones/hessonite.png',
    tagline: 'Stone of Victory & Clarity',
    benefits: [
      { icon: Flame, text: 'Clears confusion and brings quick triumph' },
      { icon: TrendingUp, text: 'Promotes social power and influence' },
      { icon: Compass, text: 'Associated with Rahu energy' },
    ],
    searchTerm: 'Hessonite',
  },
];

export const NavarathnaGemstonesShowcase: React.FC = () => {
  const [selectedGem, setSelectedGem] = useState<NavarathnaItem>(NAVARATHNA_GEMS[0]);
  const { setSelectedCategory } = useProductStore();
  const { cms } = useCMSStore();

  const contactPhone = cms.footer?.phone || '+91 78991 25449';
  const cleanPhone = contactPhone.replace(/[^\d+]/g, '') || '+917899125449';

  const handleExploreCategory = (searchTerm?: string) => {
    setSelectedCategory('Gemstones');
    if (searchTerm) {
      navigateTo(`/shop?category=Gemstones&search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigateTo('/shop?category=Gemstones');
    }
  };

  return (
    <section className="relative w-full bg-[#FAF5ED] py-18 sm:py-22 lg:py-24 border-b border-[#E9D9C5] overflow-hidden">
      {/* Background delicate lotus watermark accents */}
      <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none opacity-25 hidden md:block">
        <svg className="w-full h-full text-[#B8893D]/40" viewBox="0 0 100 400" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M-20,50 Q40,120 10,200 T30,350" />
          <path d="M10,120 Q50,110 30,80" />
          <path d="M15,190 Q65,180 40,150" />
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none opacity-25 hidden md:block">
        <svg className="w-full h-full text-[#B8893D]/40" viewBox="0 0 100 400" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M120,50 Q60,120 90,200 T70,350" />
          <path d="M90,120 Q50,110 70,80" />
          <path d="M85,190 Q35,180 60,150" />
        </svg>
      </div>

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-[#E9D9C5]/90 pb-6 gap-5 text-center md:text-left">
          <div className="space-y-1.5 max-w-3xl w-full md:w-auto">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#9A622A]">
                ASTROLOGICAL ALIGNMENT
              </span>
              <span className="h-[1px] w-10 sm:w-16 bg-[#9A622A]/50" />
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#59121E] tracking-tight uppercase leading-tight">
              CERTIFIED PRECIOUS GEMSTONES & NAVARATHNA
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6158] leading-relaxed max-w-2xl mx-auto md:mx-0">
              100% genuine unheated and lab-certified Vedic gemstones selected for astrological power and clarity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleExploreCategory()}
            className="px-7 py-3 rounded-md bg-[#54101E] hover:bg-[#6D1527] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer shrink-0 self-center md:self-auto"
          >
            <span>EXPLORE GEMSTONES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Part Layout: Left Image Display | Middle 3x3 Grid | Right Featured Gemstone Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
          
          {/* 1. Left Column: 9 Gems Marble Showcase Image */}
          <div className="lg:col-span-4 relative rounded-2xl overflow-hidden shadow-lg border border-[#E9D9C5] bg-[#EFE8DC] min-h-[380px] lg:min-h-[460px] group flex flex-col justify-end">
            <img
              src="/gemstones/navarathna-left-display.png"
              alt="Nine Precious Navarathna Gemstones on Marble"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Subtle soft gradient overlay on bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

            {/* Bottom Left Typography Tag */}
            <div className="relative z-10 p-6 sm:p-7 text-left space-y-1">
              <div className="w-6 h-[2px] bg-[#D4AF37] mb-2" />
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#F7E7CE] block drop-shadow-sm">
                NINE GEMS
              </p>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#F7E7CE] block drop-shadow-sm">
                NINE BLESSINGS
              </p>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#D4AF37] block drop-shadow-sm font-semibold">
                A BRIGHTER YOU
              </p>
            </div>
          </div>

          {/* 2. Middle Column: 3x3 Grid of Gemstones with equal ratio & transparent backgrounds */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3.5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-6 sm:w-10 bg-[#9A622A]/50" />
                <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#9A622A]">
                  EXPLORE BY GEMSTONE
                </span>
                <span className="h-[1px] w-6 sm:w-10 bg-[#9A622A]/50" />
              </div>
            </div>

            {/* 3x3 Equal Ratio Cards Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-1">
              {NAVARATHNA_GEMS.map((gem) => {
                const isSelected = selectedGem.id === gem.id;
                return (
                  <button
                    key={gem.id}
                    type="button"
                    onClick={() => setSelectedGem(gem)}
                    className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-2 border-[#7A1822] shadow-md scale-[1.03] ring-2 ring-[#7A1822]/20'
                        : 'bg-white/85 hover:bg-white border border-[#E9D9C5] hover:border-[#B8893D] shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Equal Ratio Gemstone Image (Clean transparent background) */}
                    <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 flex items-center justify-center mb-1.5 shrink-0">
                      <img
                        src={gem.image}
                        alt={`${gem.name} Gemstone`}
                        className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    <span className="font-bold text-[10px] sm:text-[11.5px] text-[#1B1A18] uppercase tracking-wider block leading-tight">
                      {gem.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#856D56] font-medium block mt-0.5">
                      ({gem.vedicName})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Right Column: Featured Gemstone Card with background image */}
          <div className="lg:col-span-4 relative rounded-2xl overflow-hidden shadow-xl bg-[#260308] bg-[url('/gemstones/featured-ruby-right.png')] bg-cover bg-center border border-[#520B13] p-7 sm:p-9 text-[#F7E7CE] flex flex-col justify-between min-h-[380px] lg:min-h-[460px]">
            {/* Dark gradient overlay for text contrast while highlighting the top-right ruby */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Top Text Info */}
            <div className="relative z-10 space-y-4 max-w-[280px] sm:max-w-[300px]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
                  FEATURED GEMSTONE
                </span>
                <span className="h-[1px] w-6 bg-[#D4AF37]/60" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight uppercase">
                  {selectedGem.name} ({selectedGem.vedicName})
                </h3>
                <p className="text-xs sm:text-[13px] text-[#D4AF37] font-medium tracking-wide">
                  {selectedGem.tagline}
                </p>
              </div>

              {/* 3 Benefit Bullets with Circular Golden Badge Icons */}
              <ul className="space-y-3.5 pt-2">
                {selectedGem.benefits.map((benefit, idx) => {
                  const IconComp = benefit.icon;
                  return (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3D0A11]/80 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-xs shrink-0">
                        <IconComp className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs sm:text-[13px] text-[#EFE3CF] leading-snug font-normal">
                        {benefit.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bottom CTA Buttons */}
            <div className="relative z-10 pt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => handleExploreCategory(selectedGem.searchTerm)}
                className="w-full py-3 px-5 rounded-md bg-white hover:bg-[#FAF0DF] text-[#54101E] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>EXPLORE {selectedGem.name} COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#54101E]" />
              </button>

              <a
                href={`tel:${cleanPhone}`}
                className="w-full py-2.5 px-4 rounded-md bg-[#3D0A11]/90 hover:bg-[#520B13] border border-[#D4AF37]/60 text-[#F7E7CE] hover:text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>CALL FOR BIRTH DATE & NAME CONSULTATION</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
