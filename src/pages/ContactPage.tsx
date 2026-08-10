import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    gmail: '',
    requirement: 'Silver Rings',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requirementOptions = [
    'Rings',
    'Earrings',
    'Neck Jewellery',
    'Pendants',
    'Bracelets & Bangles',
    'Certified Gemstones',
    'Spiritual Maalas',
    '1 to 24 Mukhi Rudrakshas',
    'God Small Statues',
    'Bespoke Custom Order',
    'General Inquiry',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.contactNumber.trim() || !formData.gmail.trim() || !formData.message.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Inquiry submitted successfully! We will contact you soon.', 'success');
      setFormData({
        name: '',
        contactNumber: '',
        gmail: '',
        requirement: 'Silver Rings',
        message: '',
      });
    }, 1000);
  };

  return (
    <div className="w-full bg-[#FFF9F0] py-12 sm:py-20 text-[#281C18]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#B8893D]/20 border border-[#B8893D]/40 text-[#7A1822] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#B8893D]" /> Personal Consultation & Support
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#281C18]">
            Get In Touch With Us
          </h1>
          <p className="text-xs sm:text-base text-[#796A65] leading-relaxed font-sans">
            Have a custom requirement, gemstone inquiry, or need assistance selecting the perfect sacred creation? Fill out the form below and our specialists will assist you immediately.
          </p>
          <div className="w-16 h-0.5 bg-[#B8893D] mx-auto" />
        </div>

        {/* Main Content Grid: Info Cards + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Contact Details & Store Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#2D080C] text-[#FFF9F0] rounded-3xl p-6 sm:p-8 border border-[#B8893D]/40 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8893D]">Guru Diamonds Store</span>
                <h3 className="font-serif text-2xl font-bold text-[#FFF9F0]">Contact Details</h3>
                <p className="text-xs text-[#F4E4C8]/80 leading-relaxed">
                  Visit our flagship store or reach out through direct communication channels.
                </p>
              </div>

              <div className="space-y-5 pt-2 text-xs sm:text-sm">
                <div className="flex items-start gap-4 p-3.5 bg-[#FFFFFF]/5 rounded-2xl border border-[#B8893D]/20">
                  <Phone className="w-5 h-5 text-[#B8893D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#F4E4C8] uppercase text-[11px] tracking-wider">Contact Number</h4>
                    <p className="text-[#FFF9F0] font-semibold mt-0.5">+91 78991 25449</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 bg-[#FFFFFF]/5 rounded-2xl border border-[#B8893D]/20">
                  <Mail className="w-5 h-5 text-[#B8893D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#F4E4C8] uppercase text-[11px] tracking-wider">Gmail / Email</h4>
                    <p className="text-[#FFF9F0] font-semibold mt-0.5">info@gurudimonds.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 bg-[#FFFFFF]/5 rounded-2xl border border-[#B8893D]/20">
                  <MapPin className="w-5 h-5 text-[#B8893D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#F4E4C8] uppercase text-[11px] tracking-wider">Store Address</h4>
                    <p className="text-[#FFF9F0]/90 leading-relaxed mt-0.5">
                      No. 1108, 1st Cross, Kurubageri, Lashkar Mohalla, Mysuru, Karnataka - 570001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 bg-[#FFFFFF]/5 rounded-2xl border border-[#B8893D]/20">
                  <Clock className="w-5 h-5 text-[#B8893D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#F4E4C8] uppercase text-[11px] tracking-wider">Business Hours</h4>
                    <p className="text-[#FFF9F0]/90 mt-0.5">Monday – Saturday: 10:00 AM – 8:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E9D9C5] rounded-3xl p-6 space-y-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B8893D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2E7D5B]" /> Custom Commissions Guarantee
              </span>
              <h4 className="font-serif font-bold text-base text-[#281C18]">100% Genuine & Verified</h4>
              <p className="text-xs text-[#796A65] leading-relaxed">
                All custom jewellery orders, 1-24 Mukhi Rudraksha configurations, and natural gemstone settings come with BIS hallmarking and lab verification reports.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border-2 border-[#E9D9C5] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <div className="space-y-1 border-b border-[#E9D9C5] pb-4">
              <h3 className="font-serif text-2xl font-bold text-[#281C18]">Send Your Requirement</h3>
              <p className="text-xs text-[#796A65]">
                Fill in your details below and we will get back to you within 24 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-[#FFF9F0] border-2 border-[#B8893D]/40 rounded-2xl p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-14 h-14 bg-[#2E7D5B]/10 text-[#2E7D5B] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#281C18]">Thank You!</h4>
                <p className="text-xs sm:text-sm text-[#796A65] max-w-md mx-auto leading-relaxed">
                  Your requirement details have been received successfully. Our sales team will reach out to your phone number / Gmail shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-[#7A1822] text-[#FFF9F0] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#4D1017] transition-all shadow-md"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="block font-bold text-[#281C18]">
                    Name <span className="text-[#7A1822]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl px-4 py-3 text-[#281C18] placeholder-[#796A65]/70 focus:outline-none focus:border-[#B8893D] focus:ring-2 focus:ring-[#B8893D]/20 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* 2. Contact Number */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-number" className="block font-bold text-[#281C18]">
                      Contact Number <span className="text-[#7A1822]">*</span>
                    </label>
                    <input
                      id="contact-number"
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl px-4 py-3 text-[#281C18] placeholder-[#796A65]/70 focus:outline-none focus:border-[#B8893D] focus:ring-2 focus:ring-[#B8893D]/20 transition-all font-medium"
                    />
                  </div>

                  {/* 3. Gmail / Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-gmail" className="block font-bold text-[#281C18]">
                      Gmail / Email <span className="text-[#7A1822]">*</span>
                    </label>
                    <input
                      id="contact-gmail"
                      type="email"
                      name="gmail"
                      value={formData.gmail}
                      onChange={handleChange}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl px-4 py-3 text-[#281C18] placeholder-[#796A65]/70 focus:outline-none focus:border-[#B8893D] focus:ring-2 focus:ring-[#B8893D]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* 4. Requirement Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-requirement" className="block font-bold text-[#281C18]">
                    Requirement Category <span className="text-[#7A1822]">*</span>
                  </label>
                  <select
                    id="contact-requirement"
                    name="requirement"
                    value={formData.requirement}
                    onChange={handleChange}
                    className="w-full bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl px-4 py-3 text-[#281C18] focus:outline-none focus:border-[#B8893D] focus:ring-2 focus:ring-[#B8893D]/20 transition-all font-medium"
                  >
                    {requirementOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Message */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="block font-bold text-[#281C18]">
                    Message / Special Instructions <span className="text-[#7A1822]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your design specifications, ring size, gemstone preference, or specific custom order instructions..."
                    required
                    className="w-full bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl px-4 py-3 text-[#281C18] placeholder-[#796A65]/70 focus:outline-none focus:border-[#B8893D] focus:ring-2 focus:ring-[#B8893D]/20 transition-all font-medium resize-y"
                  />
                </div>

                {/* 6. Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-12 btn-12-gold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <span>Submit Requirement</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
