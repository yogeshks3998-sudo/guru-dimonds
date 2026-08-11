import React, { useState } from 'react';
import {
  FileText,
  CreditCard,
  Truck,
  XCircle,
  RotateCcw,
  RefreshCw,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { navigateTo } from '../utils/navigation';

export const TermsPoliciesPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');

  const navItems = [
    { id: 'general', label: 'General Terms', icon: FileText },
    { id: 'orders-payments', label: 'Orders & Payments', icon: CreditCard },
    { id: 'shipping-delivery', label: 'Shipping & Delivery', icon: Truck },
    { id: 'cancellation', label: 'Cancellation', icon: XCircle },
    { id: 'returns-refunds', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'exchange', label: 'Exchange Policy', icon: RefreshCw },
    { id: 'warranty-authenticity', label: 'Warranty & Authenticity', icon: Award },
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
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8893D]/10 border border-[#B8893D]/30 text-xs font-bold uppercase tracking-widest text-[#A67C32]">
            <ShieldCheck className="w-4 h-4 text-[#B8893D]" />
            Official Store Policies
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1B1A18] tracking-tight">
            Terms & Operating Policies
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#1B1A18]/70 leading-relaxed">
            Everything you need to know regarding purchases, certified gemstones, jewellery returns, insured shipping, and lifetime trust at Guru Diamonds.
          </p>
          <div className="w-16 h-0.5 bg-[#B8893D] mx-auto rounded-full" />
        </div>

        {/* Layout Grid: Sidebar Navigation + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Sidebar Nav */}
          <div className="lg:col-span-4 sticky top-6 z-20 space-y-3">
            <div className="bg-white border border-[#E7E1D7] rounded-3xl p-5 shadow-sm space-y-2">
              <h3 className="font-serif font-bold text-sm text-[#1B1A18] px-3 py-1 uppercase tracking-wider text-xs border-b border-[#E7E1D7] pb-2">
                Policy Sections
              </h3>
              <nav className="space-y-1 pt-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#2D080C] text-[#FFF9F0] shadow-md border border-[#B8893D]/40'
                          : 'text-[#1B1A18]/80 hover:bg-[#FAF8F3] hover:text-[#1B1A18]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#B8893D]' : 'text-[#A67C32]'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#B8893D]' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-[#2D080C] text-[#FFF9F0] p-5 rounded-3xl border border-[#B8893D]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-[#B8893D]">
                <ShieldCheck className="w-4 h-4 text-[#B8893D]" />
                Customer Support Assistance
              </div>
              <p className="text-xs text-[#F4E4C8]/80 leading-relaxed">
                Have specific questions about sizing, lab certifications, or returns before placing an order?
              </p>
              <button
                onClick={() => navigateTo('/contact')}
                className="w-full py-2.5 rounded-xl bg-[#B8893D] text-[#2D080C] font-bold text-xs hover:bg-[#c99a4e] transition-colors"
              >
                Contact Support Team
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10 bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-10 shadow-sm">
            {/* 1. General Terms */}
            <section id="general" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-3">
                <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1A18]">1. General Terms & Conditions</h2>
                  <p className="text-xs text-[#1B1A18]/60">Platform governance, agreement, and identity</p>
                </div>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
                <p>
                  Welcome to <strong>Guru Diamonds</strong> (accessible at gurudimonds.in). By accessing our storefront, creating an account, or purchasing gemstones, rudrakshas, or silver jewellery, you agree to be bound by these Terms & Conditions.
                </p>
                <p>
                  Guru Diamonds has operated as a trusted provider of natural gemstones and silver ornaments since 2000 in Mysuru, Karnataka, India. All content, images, trademarks, and design systems are the intellectual property of Guru Diamonds.
                </p>
              </div>
            </section>

            {/* 2. Orders & Payments */}
            <section id="orders-payments" className="scroll-mt-24 space-y-4 pt-6 border-t border-[#E7E1D7]">
              <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-3">
                <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1A18]">2. Orders & Payments Policy</h2>
                  <p className="text-xs text-[#1B1A18]/60">Pricing, payment gateways, and rate adjustments</p>
                </div>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
                <p>
                  All prices listed on Guru Diamonds are stated in Indian Rupees (INR ₹) inclusive of applicable taxes unless explicitly specified otherwise.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-1">
                    <h4 className="font-bold text-xs text-[#A67C32] uppercase tracking-wider">Accepted Payment Methods</h4>
                    <p className="text-xs text-[#1B1A18]/70">UPI (GPay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Bank Transfer.</p>
                  </div>
                  <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-1">
                    <h4 className="font-bold text-xs text-[#A67C32] uppercase tracking-wider">Dynamic Metal Rates</h4>
                    <p className="text-xs text-[#1B1A18]/70">Gold and silver metal components in custom rings/pendants are updated dynamically based on prevailing market rates.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Shipping & Delivery */}
            <section id="shipping-delivery" className="scroll-mt-24 space-y-4 pt-6 border-t border-[#E7E1D7]">
              <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-3">
                <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1A18]">3. Shipping & Delivery Policy</h2>
                  <p className="text-xs text-[#1B1A18]/60">Insured courier dispatch, packaging, and timelines</p>
                </div>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
                <div className="p-4 bg-[#2D080C] text-[#FFF9F0] rounded-2xl border border-[#B8893D]/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#B8893D] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <strong className="text-[#B8893D] uppercase tracking-wider block font-serif">100% Insured Express Shipping</strong>
                    <p className="text-[#F4E4C8]/90">
                      Every gemstone and jewellery package dispatched by Guru Diamonds is fully insured against theft, loss, or transit damage until delivered into your hands.
                    </p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-xs text-[#1B1A18]/80 pl-2">
                  <li><strong>Dispatch SLAs:</strong> Loose gemstones & ready jewellery are dispatched within 24–48 hours. Custom ring/pendant mounting requires 3–5 business days.</li>
                  <li><strong>Delivery Timelines:</strong> Metro cities (2–4 business days), Rest of India (4–7 business days).</li>
                  <li><strong>Tamper-Proof Packaging:</strong> Delivered in double-sealed tamper-evident bags with unique barcode security tags.</li>
                </ul>
              </div>
            </section>

            {/* 4. Cancellation */}
            <section id="cancellation" className="scroll-mt-24 space-y-4 pt-6 border-t border-[#E7E1D7]">
              <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-3">
                <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1A18]">4. Cancellation Policy</h2>
                  <p className="text-xs text-[#1B1A18]/60">Pre-dispatch order cancellation windows</p>
                </div>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
                <p>
                  Orders for unmounted loose gemstones and ready-made inventory can be cancelled for a full refund prior to order dispatch (typically within 12–24 hours of placement).
                </p>
                <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-1 text-xs">
                  <strong className="text-[#1B1A18] font-bold">Custom & Ring Mounting Orders:</strong>
                  <p className="text-[#1B1A18]/70">
                    Once ring resizing, custom silver setting, or personalized engraving has commenced, cancellation will incur a nominal metal/craftsmanship fee.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Returns & Refunds */}
            <section id="returns-refunds" className="scroll-mt-24 space-y-4 pt-6 border-t border-[#E7E1D7]">
              <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-3">
                <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1A18]">5. Return & Refund Policy (Jewellery & Gemstones)</h2>
                  <p className="text-xs text-[#1B1A18]/60">7-Day hassle-free inspection & evaluation window</p>
                </div>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
                <p>
                  We want you to feel complete confidence in your gemstone selection. We provide a <strong>7-Day Return Guarantee</strong> for loose natural gemstones and standard jewellery products.
                </p>
                <div className="space-y-2 pt-1">
                  <h4 className="font-bold text-xs text-[#1B1A18] uppercase tracking-wider">Conditions for Valid Returns:</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-[#1B1A18]/80 pl-2">
                    <li>Items must be unworn, undamaged, with original security tags & lab certificates intact.</li>
                    <li>The original tax invoice and lab test report card must be returned inside the parcel.</li>
                    <li>Customized items (e.g., resized rings or custom engraved items) are eligible for return minus making charges.</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl text-xs space-y-1">
                  <strong className="text-[#A67C32] font-bold">Refund Processing:</strong>
                  <p className="text-[#1B1A18]/70">
                    Once the returned item passes quality verification at our Mysuru center, full refunds are processed to your original payment account within 5–7 working days.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Exchange */}
            <section id="exchange" className="scroll-mt-24 space-y-4 pt-6 border-t border-[#E7E1D7]">
              <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-3">
                <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1A18]">6. Exchange Policy & Size Adjustments</h2>
                  <p className="text-xs text-[#1B1A18]/60">Ring size exchange, chain sizing, and gemstone upgrade</p>
                </div>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-1.5">
                    <h4 className="font-bold text-xs text-[#1B1A18] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#B8893D]" /> Ring Size Exchanges
                    </h4>
                    <p className="text-xs text-[#1B1A18]/70">
                      Did the ring not fit perfectly? We offer one free ring size adjustment within 10 days of delivery.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-1.5">
                    <h4 className="font-bold text-xs text-[#1B1A18] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#B8893D]" /> Gemstone Upgrades
                    </h4>
                    <p className="text-xs text-[#1B1A18]/70">
                      Customers may exchange natural gemstones within 15 days for store credit towards higher carat weights.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Warranty & Authenticity */}
            <section id="warranty-authenticity" className="scroll-mt-24 space-y-4 pt-6 border-t border-[#E7E1D7]">
              <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-3">
                <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1A18]">7. Warranty, Certification & Damaged Items</h2>
                  <p className="text-xs text-[#1B1A18]/60">Authenticity guarantee, lab test certificates & transit damages</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
                <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs text-[#A67C32] uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#B8893D]" /> 100% Authenticity & Govt Recognized Lab Certification
                  </h4>
                  <p className="text-xs text-[#1B1A18]/70">
                    Guru Diamonds guarantees that every natural gemstone, precious stone, and rudraksha sold on our store is 100% natural, unheated/untreated (unless stated), and accompanied by an official gem lab report detailing refractive index, carat weight, and origin.
                  </p>
                </div>

                <div className="p-4 bg-[#FFF5F5] border border-red-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs text-red-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Damaged Products & Transit Claims Procedure
                  </h4>
                  <p className="text-xs text-red-950/80">
                    While every shipment is insured and packed securely, if you receive a damaged package or broken item:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-red-950/80 pl-2">
                    <li>Record a brief 30-second unboxing video showing the sealed courier outer pouch before opening.</li>
                    <li>Notify our Mysuru support team within <strong>24 hours</strong> of delivery via WhatsApp (+91 78991 25449) or email.</li>
                    <li>We will immediately dispatch a free replacement or issue a 100% instant refund upon verification.</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-1">
                  <strong className="text-[#1B1A18] font-bold text-xs">1-Year Craftsmanship Guarantee:</strong>
                  <p className="text-xs text-[#1B1A18]/70">
                    All silver jewellery prongs and gemstone mountings are covered against manufacturing defects for 12 months.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPoliciesPage;
