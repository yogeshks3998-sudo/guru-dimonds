import React from 'react';
import { navigateTo } from '../../utils/navigation';
import { useProductStore } from '../../stores/useProductStore';
import { Sparkles, ArrowRight, ShieldCheck, Gem } from 'lucide-react';

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
                    onClick={() => handleNav(() => setSelectedCategory('Rings'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    925 Silver & Gemstone Rings
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
                    onClick={() => handleNav(() => setSelectedCategory('Neck Jewellery'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Silver Necklaces & Chains
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
                    onClick={() => handleNav(() => setSelectedCategory('Rudrakshas (1 to 24 Mukhi)'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    1 to 24 Mukhi Rudrakshas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCategory('God Small Statues'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Silver God Statues & Idols
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#7A1822] uppercase tracking-wider border-b border-[#E9D9C5] pb-2">
                By Metal & Finish
              </h4>
              <ul className="space-y-2 text-xs text-[#281C18]">
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedMetal('SILVER'))}
                    className="hover:text-[#7A1822] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> 925 BIS Hallmarked Sterling Silver
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedMetal('SILVER'))}
                    className="hover:text-[#7A1822] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Fine Antique Oxidized Silver
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedMetal('SILVER'))}
                    className="hover:text-[#7A1822] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-200" /> Pure Silver Puja Idols
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
                    Women's Silver & Gemstone Jewellery
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedGender('Men'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Men's Silver Kadas & Bracelets
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav(() => setSelectedCollection('Spiritual Heritage'))}
                    className="hover:text-[#7A1822] transition-colors"
                  >
                    Vedic Prayer & Spiritual Maalas
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
                  Bespoke Custom Craftsmanship
                </h5>
                <p className="text-[11px] text-[#F4E4C8]/80 leading-relaxed font-sans">
                  Tailored Silver Jewellery, 1-24 Mukhi Rudraksha combinations & Custom Silver Idols based on your requirements.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigateTo('/contact');
                }}
                className="mt-4 px-4 py-2 bg-[#7A1822] hover:bg-[#4D1017] text-[#FFF9F0] text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-[#B8893D]/30 flex items-center justify-between"
              >
                <span>Request Custom Order</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B8893D]" />
              </button>
            </div>
          </div>
        )}

        {activeMenu === 'Gemstones' && (
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-3 col-span-2">
              <h4 className="font-serif font-bold text-sm text-[#7A1822] uppercase tracking-wider border-b border-[#E9D9C5] pb-2 flex items-center gap-2">
                <Gem className="w-4 h-4 text-[#B8893D]" /> Certified Natural Gemstones & Rudrakshas
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-[#281C18]">
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Maalas'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#7A1822] block">Natural Sphatika Quartz</span>
                  <span className="text-[11px] text-[#796A65]">108-bead certified Himalayan mala crystals</span>
                </button>
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Rudrakshas (1 to 24 Mukhi)'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#281C18] block">1 to 24 Mukhi Rudraksha</span>
                  <span className="text-[11px] text-[#796A65]">Authentic lab-tested sacred beads</span>
                </button>
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Gemstones'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#281C18] block">Natural Emeralds (Panna)</span>
                  <span className="text-[11px] text-[#796A65]">Unheated, natural astrological stones</span>
                </button>
                <button
                  onClick={() => handleNav(() => setSelectedCategory('Gemstones'))}
                  className="p-3 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all"
                >
                  <span className="font-bold text-[#281C18] block">Certified Rubies & Sapphires</span>
                  <span className="text-[11px] text-[#796A65]">Vivid certified precious gemstones</span>
                </button>
              </div>
            </div>

            <div className="bg-[#FFF9F0] rounded-2xl p-5 border border-[#E9D9C5] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B8893D] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#2E7D5B]" /> Astrological Verification
              </span>
              <h5 className="font-serif font-bold text-sm text-[#281C18]">100% Certified Origin Guarantee</h5>
              <p className="text-xs text-[#796A65] leading-relaxed">
                Every gemstone and Rudraksha at Guru Diamonds is carefully verified for authenticity and lab certified.
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
