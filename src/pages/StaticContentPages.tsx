import React from 'react';
import { ShieldCheck, Award, HelpCircle, Phone, Mail, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
    <div className="text-center space-y-3">
      <span className="text-xs font-bold uppercase tracking-widest text-[#A67C32]">Est. 1906</span>
      <h1 className="font-serif text-4xl font-bold text-[#1B1A18]">The Vedaara Fine Jewellery Story</h1>
      <div className="w-12 h-0.5 bg-[#A67C32] mx-auto" />
    </div>
    <div className="bg-white border border-[#E7E1D7] rounded-3xl p-8 space-y-4 text-xs sm:text-sm text-[#1B1A18] leading-relaxed shadow-sm">
      <p>
        Founded in 1906 in the historic goldsmithing district of Mumbai, Vedaara Fine Jewellery has represented four generations of royal craftsmanship, sacred geometry, and 100% BIS Hallmarked metal purity.
      </p>
      <p>
        Our master kaarigars combine ancient Nakshi embossing, Jaipuri Gulabi Meenakari enameling, and modern Swiss laser precision to create timeless heirlooms.
      </p>
    </div>
  </div>
);

export const ContactPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
    <div className="text-center space-y-3">
      <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Concierge & Boutiques</h1>
      <p className="text-xs text-[#6F6A62]">Our jewellery specialists are available 7 days a week.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
      <div className="bg-white border border-[#E7E1D7] p-6 rounded-2xl space-y-2">
        <Phone className="w-6 h-6 text-[#A67C32]" />
        <h4 className="font-serif font-bold text-sm">Toll Free Support</h4>
        <p className="text-[#6F6A62]">+91 1800 212 9000</p>
      </div>
      <div className="bg-white border border-[#E7E1D7] p-6 rounded-2xl space-y-2">
        <Mail className="w-6 h-6 text-[#A67C32]" />
        <h4 className="font-serif font-bold text-sm">Email Concierge</h4>
        <p className="text-[#6F6A62]">concierge@vedaara.com</p>
      </div>
      <div className="bg-white border border-[#E7E1D7] p-6 rounded-2xl space-y-2">
        <MapPin className="w-6 h-6 text-[#A67C32]" />
        <h4 className="font-serif font-bold text-sm">Flagship Boutique</h4>
        <p className="text-[#6F6A62]">MG Road, Kala Ghoda, Mumbai 400001</p>
      </div>
    </div>
  </div>
);

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
