import React from 'react';
import { ContactPage } from './ContactPage';

export { ContactPage };

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
    <div className="text-center space-y-3">
      <span className="text-xs font-bold uppercase tracking-widest text-[#A67C32]">Trusted Since 2000</span>
      <h1 className="font-serif text-4xl font-bold text-[#1B1A18]">About Guru Diamonds</h1>
      <div className="w-12 h-0.5 bg-[#A67C32] mx-auto" />
    </div>
    <div className="bg-white border border-[#E7E1D7] rounded-3xl p-8 space-y-4 text-xs sm:text-sm text-[#1B1A18] leading-relaxed shadow-sm">
      <p>
        Established in 2000, Guru Diamonds has been a trusted name in the gemstone and precious stone industry, serving customers with authenticity, quality, and excellence for over two decades.
      </p>
      <p>
        We specialize in carefully selected premium natural gemstones, precious stones, semi-precious stones, and silver jewellery. Every stone is inspected for authenticity, quality, and craftsmanship before reaching our customers.
      </p>
      <p>
        Whether you are choosing a gemstone for jewellery, astrology, investment, or gifting, our mission is to provide honest guidance, genuine products, and complete customer satisfaction.
      </p>
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

const StaticContentPage: React.FC<{ page: string; title?: string; content?: string }> = ({ page, title = '', content = '' }) => {
  if (page === 'about') return <AboutPage />;
  if (page === 'contact') return <ContactPage />;
  if (page === 'size-guide') return <SizeGuidePage />;
  return <PolicyPage title={title} content={content} />;
};

export default StaticContentPage;
