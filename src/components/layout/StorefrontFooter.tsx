import React from 'react';
import { navigateTo } from '../../utils/navigation';
import { useCMSStore } from '../../stores/useCMSStore';
import { ShieldCheck, Award, Truck, RefreshCw, Phone, Mail, MapPin, Send } from 'lucide-react';
import guruDiamondsLogo from '../../../assets/gurudimondslogo.png';

export const StorefrontFooter: React.FC = () => {
  const { cms } = useCMSStore();
  const { footer } = cms;

  return (
    <footer className="bg-[#2D080C] text-[#FFF9F0] pt-16 pb-12 border-t border-[#B8893D]/40">
      {/* Top Value Proposition Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#B8893D]/20 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#3D0B10] border border-[#B8893D]/20 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-[#B8893D] shrink-0" />
          <div>
            <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">100% Genuine Products</h4>
            <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">Authenticity You Can Trust</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#3D0B10] border border-[#B8893D]/20 shadow-inner">
          <Award className="w-8 h-8 text-[#B8893D] shrink-0" />
          <div>
            <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">IGI / SGL Certified</h4>
            <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">100% Natural Gemstones</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#3D0B10] border border-[#B8893D]/20 shadow-inner">
          <Truck className="w-8 h-8 text-[#B8893D] shrink-0" />
          <div>
            <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">Insured Express</h4>
            <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">Tamper-Proof Armored Transport</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#3D0B10] border border-[#B8893D]/20 shadow-inner">
          <RefreshCw className="w-8 h-8 text-[#B8893D] shrink-0" />
          <div>
            <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">7-Day Royal Guarantee</h4>
            <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">100% Refund or Exchange</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <button onClick={() => navigateTo('/')} className="inline-flex rounded-lg bg-[#FFF9F0] p-2" aria-label="Guru Diamonds home">
            <img src={guruDiamondsLogo} alt="Guru Diamonds" className="h-20 w-auto max-w-[250px] object-contain" />
          </button>
          <p className="text-xs text-[#F4E4C8]/80 leading-relaxed max-w-sm">{footer.aboutText}</p>
          <div className="space-y-2 text-xs text-[#F4E4C8] pt-2">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#B8893D]" /> {footer.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#B8893D]" /> {footer.email}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#B8893D] shrink-0 mt-0.5" /> {footer.address}
            </p>
          </div>
        </div>

        {/* Col 2: Jewellery Collections */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#B8893D] uppercase tracking-wider">Explore Collections</h4>
          <ul className="space-y-2 text-xs text-[#F4E4C8]/80">
            <li>
              <button onClick={() => navigateTo('/shop')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Royal Antique Polki Sets
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/shop')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                22K Gold Temple Kadas
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/shop')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Natural Certified Emeralds
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/shop')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Burma Ruby Solitaires
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/shop')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Jaipuri Meenakari Jhumkas
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/shop')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Sphatika & Rudraksha Maalas
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Guides */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#B8893D] uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-xs text-[#F4E4C8]/80">
            <li>
              <button onClick={() => navigateTo('/track-order')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Track Royal Shipment
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/size-guide')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Ring & Bangle Sizing Guide
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/jewellery-care')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Heritage Jewellery Care
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/metal-purity-guide')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Gold & Silver Purity Index
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/gemstone-guide')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                Astrological Gemstone Consultation
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('/certification')} className="hover:text-[#FFF9F0] hover:underline transition-colors">
                BIS Hallmarking Verification
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter & Legal */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-sm text-[#B8893D] uppercase tracking-wider">Guru Diamonds Journal</h4>
          <p className="text-xs text-[#F4E4C8]/80 leading-relaxed">Subscribe for gemstone guidance, new arrivals, and trusted stone buying updates.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
            <input
              type="email"
              placeholder="Patron email address"
              className="bg-[#3D0B10] border border-[#B8893D]/30 rounded-l-xl px-3 py-2 text-xs text-[#FFF9F0] placeholder-[#F4E4C8]/50 focus:outline-none focus:border-[#B8893D] w-full"
            />
            <button
              type="submit"
              className="bg-[#B8893D] hover:bg-[#966d2c] text-[#281C18] font-bold px-3 py-2 rounded-r-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-[11px] text-[#F4E4C8]/70 space-x-3">
            <button onClick={() => navigateTo('/privacy-policy')} className="hover:underline">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => navigateTo('/terms')} className="hover:underline">
              Terms
            </button>
            <span>•</span>
            <button onClick={() => navigateTo('/shipping-policy')} className="hover:underline">
              Shipping
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#B8893D]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4E4C8]/60">
        <p>© {new Date().getFullYear()} Guru Diamonds. All rights reserved.</p>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#B8893D]">
          <span>UPI / GPay</span>
          <span>•</span>
          <span>Royal Cards</span>
          <span>•</span>
          <span>NetBanking</span>
          <span>•</span>
          <span>Insured COD</span>
        </div>
      </div>
    </footer>
  );
};
