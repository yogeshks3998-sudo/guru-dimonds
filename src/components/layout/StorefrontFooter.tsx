import React from 'react';
import { navigateTo } from '../../utils/navigation';
import { useCMSStore } from '../../stores/useCMSStore';
import { useProductStore } from '../../stores/useProductStore';
import { ShieldCheck, Award, Truck, RefreshCw, Phone, Mail, MapPin, Send } from 'lucide-react';
import guruDiamondsLogo from '../../../assets/gurudimondslogo.png';

export const StorefrontFooter: React.FC = () => {
  const { cms } = useCMSStore();
  const { footer } = cms;
  const { setSelectedCategory } = useProductStore();

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    navigateTo('/shop');
  };

  return (
    <div className="pg-footer border-t border-[#B8893D]/40">
      {/* Top Value Proposition Badges */}
      <div className="bg-[#2D080C] text-[#FFF9F0] pt-12 pb-8">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#3D0B10] border border-[#B8893D]/30 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-[#B8893D] shrink-0" />
            <div>
              <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">100% Genuine</h4>
              <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">Authenticity Guaranteed</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#3D0B10] border border-[#B8893D]/30 shadow-inner">
            <Award className="w-7 h-7 text-[#B8893D] shrink-0" />
            <div>
              <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">Lab Certified</h4>
              <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">Natural Precious Stones</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#3D0B10] border border-[#B8893D]/30 shadow-inner">
            <Truck className="w-7 h-7 text-[#B8893D] shrink-0" />
            <div>
              <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">Insured Express</h4>
              <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">Tamper-Proof Transit</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#3D0B10] border border-[#B8893D]/30 shadow-inner">
            <RefreshCw className="w-7 h-7 text-[#B8893D] shrink-0" />
            <div>
              <h4 className="text-xs font-serif font-bold text-[#FFF9F0] uppercase tracking-wider">Trust Guarantee</h4>
              <p className="text-[11px] text-[#F4E4C8]/80 mt-0.5">Established Since 2000</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        {/* Decorative Wave SVG Top Header */}
        <svg className="footer-wave-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path className="footer-wave-path" d="M851.8,100c125,0,288.3-45,348.2-64V0H0v44c3.7-1,7.3-1.9,11-2.9C80.7,22,151.7,10.8,223.5,6.3C276.7,2.9,330,4,383,9.8 c52.2,5.7,103.3,16.2,153.4,32.8C623.9,71.3,726.8,100,851.8,100z"></path>
        </svg>

        {/* Main Footer Content (3 Balanced Columns) */}
        <div className="footer-content grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Column 1: Brand Info & Address */}
          <div className="md:col-span-5 space-y-4">
            <div className="footer-logo">
              <button onClick={() => navigateTo('/')} className="footer-logo-link inline-flex rounded-xl bg-[#FFF9F0] p-2.5 shadow-md">
                <img src={guruDiamondsLogo} alt="Guru Diamonds" className="h-16 w-auto max-w-[230px] object-contain" />
              </button>
            </div>
            <p className="text-sm text-[#F4E4C8]/90 leading-relaxed max-w-sm">
              Your trusted destination for precious natural gemstones, 1-24 Mukhi Rudrakshas, silver jewellery, and expert guidance since 2000.
            </p>
            <div className="space-y-2.5 text-sm text-[#F4E4C8] font-medium pt-1">
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B8893D]" /> {footer.phone || '+91 78991 25449'}
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B8893D]" /> {footer.email || 'info@gurudimonds.in'}
              </p>
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B8893D] shrink-0 mt-0.5" /> No. 1108, 1st Cross, Kurubageri, Lashkar Mohalla, Mysuru - 570001
              </p>
            </div>
          </div>

          {/* Column 2: Jewellery & Gemstone Collections */}
          <div className="md:col-span-4 md:pl-6">
            <div className="footer-menu">
              <h2 className="footer-menu-name">Collections</h2>
              <ul className="footer-menu-list">
                <li>
                  <button onClick={() => handleCategoryClick('Rings')}>Rings</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('Earrings')}>Earrings</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('Neck Jewellery')}>Neck Jewellery</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('Silver Pendants')}>Pendants</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('Silver & Navarathna Bracelets')}>Bracelets & Bangles</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('Gemstones')}>Certified Gemstones</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('Maalas')}>Spiritual Maalas</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('Rudrakshas (1 to 24 Mukhi)')}>1–24 Mukhi Rudrakshas</button>
                </li>
                <li>
                  <button onClick={() => handleCategoryClick('God Small Statues')}>God Small Statues</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Customer Care & Legal */}
          <div className="md:col-span-3 md:pl-4">
            <div className="footer-menu">
              <h2 className="footer-menu-name">Customer Care</h2>
              <ul className="footer-menu-list">
                <li>
                  <button onClick={() => navigateTo('/about')}>About Us</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/contact')}>Contact Us</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/track-order')}>Track Order</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/size-guide')}>Ring Size Guide</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/privacy-policy')}>Privacy Policy</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/terms')}>Terms & Conditions</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Floating Social Amoeba Corner SVG */}
          <div className="footer-social-links hidden md:block">
            <svg className="footer-social-amoeba-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 236 54">
              <path className="footer-social-amoeba-path" d="M223.06,43.32c-.77-7.2,1.87-28.47-20-32.53C187.78,8,180.41,18,178.32,20.7s-5.63,10.1-4.07,16.7-.13,15.23-4.06,15.91-8.75-2.9-6.89-7S167.41,36,167.15,33a18.93,18.93,0,0,0-2.64-8.53c-3.44-5.5-8-11.19-19.12-11.19a21.64,21.64,0,0,0-18.31,9.18c-2.08,2.7-5.66,9.6-4.07,16.69s.64,14.32-6.11,13.9S108.35,46.5,112,36.54s-1.89-21.24-4-23.94S96.34,0,85.23,0,57.46,8.84,56.49,24.56s6.92,20.79,7,24.59c.07,2.75-6.43,4.16-12.92,2.38s-4-10.75-3.46-12.38c1.85-6.6-2-14-4.08-16.69a21.62,21.62,0,0,0-18.3-9.18C13.62,13.28,9.06,19,5.62,24.47A18.81,18.81,0,0,0,3,33a21.85,21.85,0,0,0,1.58,9.08,16.58,16.58,0,0,1,1.06,5A6.75,6.75,0,0,1,0,54H236C235.47,54,223.83,50.52,223.06,43.32Z"></path>
            </svg>

            <a className="footer-social-link" style={{ left: '15px', top: '11px' }} href="https://wa.me/917899125449" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <Phone className="w-5 h-5 text-[#FFF9F0]" />
            </a>

            <a className="footer-social-link" style={{ left: '72px', top: '5px' }} href="mailto:info@gurudimonds.in" aria-label="Email">
              <Mail className="w-5 h-5 text-[#FFF9F0]" />
            </a>

            <a className="footer-social-link" style={{ left: '130px', top: '12px' }} href="/contact" aria-label="Location">
              <MapPin className="w-5 h-5 text-[#FFF9F0]" />
            </a>

            <a className="footer-social-link" style={{ left: '180px', top: '7px' }} href="/contact" aria-label="Contact">
              <Send className="w-5 h-5 text-[#FFF9F0]" />
            </a>
          </div>
        </div>

        {/* Footer Copyright Bar */}
        <div className="footer-copyright">
          <div className="footer-copyright-wrapper">
            <p className="footer-copyright-text">
              © {new Date().getFullYear()} Guru Diamonds. All rights reserved. | No. 1108, 1st Cross, Kurubageri, Lashkar Mohalla, Mysuru - 570001, Karnataka, India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontFooter;
