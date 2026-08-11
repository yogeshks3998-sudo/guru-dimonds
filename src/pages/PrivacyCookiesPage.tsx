import React, { useState } from 'react';
import { ShieldCheck, Cookie, Lock, Eye, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

export const PrivacyCookiesPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('privacy');

  const sections = [
    { id: 'privacy', title: 'Privacy Policy', icon: ShieldCheck },
    { id: 'cookies', title: 'Cookie Policy', icon: Cookie },
    { id: 'security', title: 'Data Storage & Security', icon: Lock },
    { id: 'analytics', title: 'Analytics & Tracking', icon: Eye },
    { id: 'rights', title: 'Customer Rights', icon: UserCheck },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8893D]/10 border border-[#B8893D]/30 text-xs font-bold uppercase tracking-widest text-[#A67C32]">
            <ShieldCheck className="w-4 h-4 text-[#B8893D]" />
            Transparency & Security
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1B1A18] tracking-tight">
            Privacy & Cookie Policy
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#1B1A18]/70 leading-relaxed">
            Guru Diamonds is dedicated to protecting your privacy, securing your personal data, and maintaining complete transparency regarding how your information is handled.
          </p>
          <div className="w-16 h-0.5 bg-[#B8893D] mx-auto rounded-full" />
        </div>

        {/* Quick Nav Badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 sticky top-4 z-20 bg-[#FAF8F3]/95 backdrop-blur-md py-3 border-y border-[#E7E1D7]">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#2D080C] text-[#FFF9F0] shadow-md border border-[#B8893D]/40'
                    : 'bg-white text-[#1B1A18]/80 hover:bg-[#F4E4C8]/30 border border-[#E7E1D7]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B8893D]' : 'text-[#A67C32]'}`} />
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="space-y-12 bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-10 shadow-sm">
          {/* Section 1: Privacy Policy */}
          <section id="privacy" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">1. Privacy Policy & Data Collection</h2>
                <p className="text-xs text-[#1B1A18]/60">How we collect and handle your personal details</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
              <p>
                When you visit Guru Diamonds, register an account, make a gemstone purchase, or request personalized gemstone consultation, we collect specific personal details necessary to fulfill your orders and deliver exceptional customer service.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E7E1D7] space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#A67C32] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#B8893D]" />
                    Information You Provide
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#1B1A18]/70">
                    <li>Full Name, Email Address, and Contact Number</li>
                    <li>Billing & Delivery Addresses across India & Internationally</li>
                    <li>Ring sizes, astrological preferences (where requested)</li>
                    <li>Customer support communications & reviews</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E7E1D7] space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#A67C32] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#B8893D]" />
                    Automated Data Collection
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#1B1A18]/70">
                    <li>IP address, browser type, and device identifiers</li>
                    <li>Pages viewed, products searched, and cart additions</li>
                    <li>Time spent on pages and referral source URLs</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Cookie Policy */}
          <section id="cookies" className="scroll-mt-24 space-y-6 pt-6 border-t border-[#E7E1D7]">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <Cookie className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">2. Cookie Policy</h2>
                <p className="text-xs text-[#1B1A18]/60">Cookies, local storage, and session preferences</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
              <p>
                Guru Diamonds uses cookies and browser local storage technology to deliver a seamless shopping experience. Cookies allow our platform to remember your cart items, keep you signed in, and save your wishlist preferences.
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E7E1D7]">
                  <h4 className="font-bold text-xs text-[#1B1A18] mb-1">Essential Cookies</h4>
                  <p className="text-xs text-[#1B1A18]/70">
                    Required for core store functions such as shopping cart persistence, secure customer login, and checkout processing.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E7E1D7]">
                  <h4 className="font-bold text-xs text-[#1B1A18] mb-1">Functional Cookies</h4>
                  <p className="text-xs text-[#1B1A18]/70">
                    Used to remember user preferences (e.g., currency displays, recently viewed gemstones, and applied promo codes).
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E7E1D7]">
                  <h4 className="font-bold text-xs text-[#1B1A18] mb-1">Managing Cookies</h4>
                  <p className="text-xs text-[#1B1A18]/70">
                    You can adjust your web browser settings to block or delete cookies at any time. However, disabling essential cookies may prevent cart features from working correctly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Data Storage & Security */}
          <section id="security" className="scroll-mt-24 space-y-6 pt-6 border-t border-[#E7E1D7]">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">3. Data Storage & Security</h2>
                <p className="text-xs text-[#1B1A18]/60">How we safeguard your financial and personal data</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
              <p>
                We implement industry-standard 256-bit SSL encryption across our entire website. All financial transactions (UPI, Credit/Debit cards, Net Banking) are securely processed via PCI-DSS compliant banking partners.
              </p>
              <div className="bg-[#2D080C] text-[#FFF9F0] p-5 rounded-2xl border border-[#B8893D]/30 space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#B8893D]">Zero Credit Card Storage Policy</h4>
                <p className="text-xs text-[#F4E4C8]/90">
                  Guru Diamonds never stores your complete debit/credit card numbers, CVVs, or UPI PINs on our servers. All sensitive payment details pass directly to bank gateways.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Analytics & Tracking */}
          <section id="analytics" className="scroll-mt-24 space-y-6 pt-6 border-t border-[#E7E1D7]">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">4. Analytics & Third-Party Tracking</h2>
                <p className="text-xs text-[#1B1A18]/60">Aggregated usage data and service integrations</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
              <p>
                We may use privacy-compliant web analytics tools to understand site traffic patterns, improve navigation speed, and optimize product listings. This data is analyzed in aggregated, anonymized formats.
              </p>
              <p>
                We do not sell, rent, or trade your personal information to third-party advertisers or data brokers under any circumstances.
              </p>
            </div>
          </section>

          {/* Section 5: Customer Rights */}
          <section id="rights" className="scroll-mt-24 space-y-6 pt-6 border-t border-[#E7E1D7]">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">5. Your Customer Rights</h2>
                <p className="text-xs text-[#1B1A18]/60">Controlling your personal information</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
              <p>As a customer of Guru Diamonds, you retain full rights over your data, including:</p>
              <ul className="list-disc list-inside space-y-2 text-xs text-[#1B1A18]/80 pl-2">
                <td><strong>Access & Copy:</strong> You can request a summary of personal information held in your customer account.</td>
                <td><strong>Correction:</strong> You may update address or contact details at any time via your account page or by contacting support.</td>
                <td><strong>Account Deletion:</strong> You may request permanent deletion of your account and personal history, subject to legal tax invoice retention requirements.</td>
              </ul>

              <div className="pt-4 flex flex-wrap gap-4 items-center justify-between bg-[#FAF8F3] p-5 rounded-2xl border border-[#E7E1D7]">
                <div>
                  <h4 className="font-bold text-xs text-[#1B1A18]">Have questions regarding your data privacy?</h4>
                  <p className="text-xs text-[#1B1A18]/60">Contact our privacy team directly for assistance.</p>
                </div>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D080C] text-[#FFF9F0] hover:bg-[#3D0B10] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Contact Privacy Team <ArrowRight className="w-3.5 h-3.5 text-[#B8893D]" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCookiesPage;
