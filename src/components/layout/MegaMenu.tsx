import React from 'react';
import { navigateTo } from '../../utils/navigation';
import { useProductStore } from '../../stores/useProductStore';
import { Sparkles, ArrowRight, ShieldCheck, Gem, Award } from 'lucide-react';

interface MegaMenuProps {
  activeMenu: string | null;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ activeMenu, onClose }) => {
  const { setSelectedCategory, setSelectedGender, setSelectedCollection, setSelectedMetal } = useProductStore();

  if (!activeMenu) return null;

  const handleNav = (action: () => void) => {
    action();
    onClose();
    navigateTo('/shop');
  };

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-[#FFFFFF] border-b border-[#E9D9C5] shadow-2xl z-40 animate-fadeIn transition-all"
    >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeMenu === 'Jewellery' && (
          <div className="grid grid-cols-4 gap-8">
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#7A1822] uppercase tracking-wider border-b border-[#E9D9C5] pb-2">
                By Jewellery Type
              </h4>
              <ul className="space-y-2 text-xs text-[#281C18]">
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCategory('Gold rings'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    22K & 18K Gold Rings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCategory('Earrings'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Jhumkas & Studs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCategory('Chains'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Royal Gold & Silver Chains
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCategory('Necklaces'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Bridal Chokers & Necklaces
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCategory('Maalas'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Sacred Sphatika & Rudraksha Maalas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCategory('Pendants'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Gemstone & Temple Pendants
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#7A1822] uppercase tracking-wider border-b border-[#E9D9C5] pb-2">
                By Metal & Purity
              </h4>
              <ul className="space-y-2 text-xs text-[#281C18]">
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedMetal('GOLD'))}
                    className="hover:text-[#7A1822] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#B8893D]" /> 22K (916) Hallmark Gold
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedMetal('GOLD'))}
                    className="hover:text-[#7A1822] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#D8C29D]" /> 18K (750) Diamond Gold
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedMetal('SILVER'))}
                    className="hover:text-[#7A1822] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> 925 Sterling Silver
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedMetal('GOLD'))}
                    className="hover:text-[#7A1822] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#B8893D]" /> 24K Pure Investment Coins
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#7A1822] uppercase tracking-wider border-b border-[#E9D9C5] pb-2">
                By Patron & Occasion
              </h4>
              <ul className="space-y-2 text-xs text-[#281C18]">
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedGender('Women'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Women's Gemstone Jewellery
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedGender('Men'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Men's Kadas & Solid Chains
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCollection('Spiritual Heritage'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Vedic Prayer & Spiritual
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCollection('Royal Bridal'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Bridal Trousseau Masterpieces
                  </button>
                </li>
              </ul>
            </div>

            {/* Campaign Visual Banner */}
            <div className="bg-[#2D080C] rounded-2xl p-5 text-[#FFF9F0] border border-[#B8893D]/30 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#B8893D] bg-[#B8893D]/20 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Custom Commissions
                </span>
                <h5 className="font-product font-bold text-base text-[#FFF9F0] leading-snug">
                  Bespoke Goldsmith Artistry
                </h5>
                <p className="text-[11px] text-[#F4E4C8]/80 leading-relaxed font-sans">
                  Craft a personalized heirloom piece with our master goldsmiths in Jaipur and Mumbai.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigateTo('/custom-jewellery');
                }}
                className="mt-4 px-4 py-2 bg-[#7A1822] hover:bg-[#4D1017] text-[#FFF9F0] text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-[#B8893D]/30 flex items-center justify-between"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B8893D]" />
              </button>
            </div>
          </div>
        )}

        {activeMenu === 'Gemstones' && (
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-3 col-span-2">
              <h4 className="font-serif font-bold text-sm text-[#7A1822] uppercase tracking-wider border-b border-[#E9D9C5] pb-2 flex items-center gap-2">
                <Gem className="w-4 h-4 text-[#B8893D]" /> SGL / IGI Certified Natural Gemstones
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-[#281C18]">
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Gemstones'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#7A1822] block">Natural Sphatika Quartz</span>
                  <span className="text-[11px] text-[#796A65]">108-bead certified Himalayan mala crystals</span>
                </button>
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Gemstones'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#281C18] block">5-Mukhi Rudraksha Beads</span>
                  <span className="text-[11px] text-[#796A65]">Authentic lab-tested sacred beads</span>
                </button>
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Gemstones'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#281C18] block">Zambian Emeralds (Panna)</span>
                  <span className="text-[11px] text-[#796A65]">Unheated, natural astrological stones</span>
                </button>
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Gemstones'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#281C18] block">Burmese Rubies (Manik)</span>
                  <span className="text-[11px] text-[#796A65]">Vivid red certified precious gemstones</span>
                </button>
              </div>
            </div>

            <div className="bg-[#FFF9F0] rounded-2xl p-5 border border-[#E9D9C5] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B8893D] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#2E7D5B]" /> Astrological Verification
              </span>
              <h5 className="font-serif font-bold text-sm text-[#281C18]">100% Certified Origin Guarantee</h5>
              <p className="text-xs text-[#796A65] leading-relaxed">
                Every gemstone sold at Guru Diamonds is carefully verified for authenticity, quality, and customer confidence.
              </p>
              <button
                onClick={() => handleNav(() => setSelectedCategory('Gemstones'))}
                className="text-xs font-bold text-[#7A1822] hover:underline flex items-center gap-1"
              >
                <span>View All Gemstones</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B8893D]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
