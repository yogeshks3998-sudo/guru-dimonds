import React from 'react';
import { navigateTo } from '../../utils/navigation';
import { useCMSStore } from '../../stores/useCMSStore';
import { useProductStore } from '../../stores/useProductStore';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import guruDiamondsLogo from '../../../assets/gurudimondslogo.png';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61567178701595';
const INSTAGRAM_URL = 'https://www.instagram.com/guru_diamonds?stkn=YWZpeHc1dm9taGtr';

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

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B8893D]">Follow Us:</span>
              <div className="flex items-center gap-2.5">
                <a
                  href={footer.instagram || INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Guru Diamonds on Instagram"
                  className="w-8 h-8 rounded-full bg-[#FAF0DE]/10 hover:bg-[#B8893D] border border-[#B8893D]/40 hover:border-[#B8893D] flex items-center justify-center text-[#F4E4C8] hover:text-[#2A050A] transition-all transform hover:scale-110 shadow-xs"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={footer.facebook || FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Guru Diamonds on Facebook"
                  className="w-8 h-8 rounded-full bg-[#FAF0DE]/10 hover:bg-[#B8893D] border border-[#B8893D]/40 hover:border-[#B8893D] flex items-center justify-center text-[#F4E4C8] hover:text-[#2A050A] transition-all transform hover:scale-110 shadow-xs"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
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
          <div className="md:col-span-3 md:pl-4 space-y-6">
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
              </ul>
            </div>

            <div className="footer-menu">
              <h2 className="footer-menu-name">Legal</h2>
              <ul className="footer-menu-list">
                <li>
                  <button onClick={() => navigateTo('/privacy-policy')}>Privacy & Cookies</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/terms-and-policies')}>Terms & Policies</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/disclaimer-grievance')}>Disclaimer & Grievance</button>
                </li>
              </ul>
            </div>
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
