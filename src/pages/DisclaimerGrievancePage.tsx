import React from 'react';
import { HelpCircle, Scale, MessageSquare, MapPin, Phone, Mail, Clock, Building2, AlertCircle, ArrowRight } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

export const DisclaimerGrievancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8893D]/10 border border-[#B8893D]/30 text-xs font-bold uppercase tracking-widest text-[#A67C32]">
            <Scale className="w-4 h-4 text-[#B8893D]" />
            Legal Notice & Customer Support
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1B1A18] tracking-tight">
            Disclaimer & Grievance Redressal
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#1B1A18]/70 leading-relaxed">
            Legal disclaimers regarding natural gemstones, spiritual items, and our official consumer complaint redressal framework.
          </p>
          <div className="w-16 h-0.5 bg-[#B8893D] mx-auto rounded-full" />
        </div>

        {/* Content Container */}
        <div className="space-y-10">
          {/* Card 1: Legal & Product Disclaimer */}
          <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">1. Legal & Product Disclaimer</h2>
                <p className="text-xs text-[#1B1A18]/60">Important information about natural gemstones, rudrakshas & astrology</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
              <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#A67C32]">Astrological & Spiritual Guidance Disclaimer</h3>
                <p className="text-xs text-[#1B1A18]/70 leading-relaxed">
                  Astrological recommendations, planetary gemstone suggestions, and spiritual attributes associated with Rudrakshas or Navarathnas provided on this site or by our staff are based on traditional Vedic principles and historical belief systems. Results and experiences vary individually. Gemstones and rudrakshas are not intended to diagnose, treat, or replace professional medical, legal, financial, or clinical advice.
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#A67C32]">Natural Stone Variations & Inclusions</h3>
                <p className="text-xs text-[#1B1A18]/70 leading-relaxed">
                  As 100% natural earth-mined products, gemstones and rudrakshas naturally possess unique internal inclusions, slight color undertones, and natural carat variations. Product photos are taken under studio lighting; minor color differences may appear across different device monitors.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Grievance Redressal Mechanism */}
          <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">2. Grievance Redressal & Customer Escalation</h2>
                <p className="text-xs text-[#1B1A18]/60">Structured resolution procedure for customer complaints</p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-[#1B1A18]/80 leading-relaxed">
              <p>
                In compliance with the Consumer Protection (E-Commerce) Rules and applicable Indian laws, Guru Diamonds has established a formal Grievance Redressal Cell to handle customer concerns promptly and fairly.
              </p>

              {/* Escalation Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#E7E1D7] space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#A67C32]">Level 1 - Frontline Support</div>
                  <h4 className="font-serif font-bold text-sm text-[#1B1A18]">Customer Care</h4>
                  <p className="text-xs text-[#1B1A18]/70">
                    Reach out via phone, email, or WhatsApp.
                  </p>
                  <p className="text-[11px] font-semibold text-[#A67C32] pt-1">SLA: Response within 24 Hours</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#E7E1D7] space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#A67C32]">Level 2 - Supervisor</div>
                  <h4 className="font-serif font-bold text-sm text-[#1B1A18]">Escalation Desk</h4>
                  <p className="text-xs text-[#1B1A18]/70">
                    If unresolved within 48 hours, request escalation to the Store Manager.
                  </p>
                  <p className="text-[11px] font-semibold text-[#A67C32] pt-1">SLA: Resolution within 3 Days</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#2D080C] text-[#FFF9F0] border border-[#B8893D]/30 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8893D]">Level 3 - Nodal Officer</div>
                  <h4 className="font-serif font-bold text-sm text-[#FFF9F0]">Grievance Officer</h4>
                  <p className="text-xs text-[#F4E4C8]/80">
                    Direct formal complaint to designated Nodal Grievance Head.
                  </p>
                  <p className="text-[11px] font-semibold text-[#B8893D] pt-1">SLA: Final Closure within 7 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Grievance Officer & Contact Information */}
          <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E7E1D7] pb-4">
              <div className="p-2.5 rounded-xl bg-[#2D080C] text-[#B8893D]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">3. Nodal Grievance Officer & Business Details</h2>
                <p className="text-xs text-[#1B1A18]/60">Official contact information and legal entity details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3.5 bg-[#FAF8F3] p-6 rounded-2xl border border-[#E7E1D7]">
                <h3 className="font-serif font-bold text-sm text-[#2D080C] uppercase tracking-wider border-b border-[#E7E1D7] pb-2">
                  Designated Grievance Officer
                </h3>
                <div className="space-y-2.5 text-xs text-[#1B1A18]/80">
                  <p><strong>Nodal Officer:</strong> Head of Consumer Complaints, Guru Diamonds</p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#B8893D]" />
                    <span><strong>Email:</strong> support@gurudimonds.in</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#B8893D]" />
                    <span><strong>Direct Helpline:</strong> +91 78991 25449</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B8893D]" />
                    <span><strong>Working Hours:</strong> Mon - Sat (10:00 AM - 7:00 PM IST)</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 bg-[#FAF8F3] p-6 rounded-2xl border border-[#E7E1D7]">
                <h3 className="font-serif font-bold text-sm text-[#2D080C] uppercase tracking-wider border-b border-[#E7E1D7] pb-2">
                  Registered Business Address
                </h3>
                <div className="space-y-2.5 text-xs text-[#1B1A18]/80">
                  <p><strong>Entity Name:</strong> Guru Diamonds</p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#B8893D] shrink-0 mt-0.5" />
                    <span>
                      No. 1108, 1st Cross, Kurubageri, Lashkar Mohalla, Mysuru - 570001, Karnataka, India
                    </span>
                  </p>
                  <p><strong>Jurisdiction:</strong> Mysuru Courts, Karnataka, India</p>
                  <p><strong>Established:</strong> Year 2000</p>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => navigateTo('/contact')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D080C] text-[#FFF9F0] hover:bg-[#3D0B10] font-serif text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
              >
                Go To Contact Page <ArrowRight className="w-4 h-4 text-[#B8893D]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerGrievancePage;
