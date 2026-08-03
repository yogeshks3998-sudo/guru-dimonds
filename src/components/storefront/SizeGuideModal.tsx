import React, { useState } from 'react';
import { X, Ruler, Sparkles, CheckCircle2 } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category = 'Rings' }) => {
  const [activeTab, setActiveTab] = useState<'RING' | 'CHAIN' | 'CALCULATOR'>('RING');
  const [mmInput, setMmInput] = useState('');
  const [calculatedSize, setCalculatedSize] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(mmInput);
    if (isNaN(val) || val < 12 || val > 25) {
      setCalculatedSize('Invalid diameter. Please enter between 12mm and 25mm.');
      return;
    }
    // Formula for Indian ring size approximate: (Diameter - 13.8) / 0.8 + 6
    const calculated = Math.round((val - 13.8) / 0.8 + 6);
    const clamped = Math.max(6, Math.min(30, calculated));
    setCalculatedSize(`Recommended Indian Ring Size: ${clamped} (Diameter: ${val} mm)`);
  };

  const ringSizes = [
    { size: '6', dia: '14.5 mm', circ: '45.5 mm' },
    { size: '8', dia: '15.1 mm', circ: '47.4 mm' },
    { size: '10', dia: '15.7 mm', circ: '49.3 mm' },
    { size: '12', dia: '16.3 mm', circ: '51.2 mm' },
    { size: '14', dia: '17.0 mm', circ: '53.4 mm' },
    { size: '16', dia: '17.6 mm', circ: '55.3 mm' },
    { size: '18', dia: '18.2 mm', circ: '57.2 mm' },
    { size: '20', dia: '18.8 mm', circ: '59.1 mm' },
    { size: '22', dia: '19.5 mm', circ: '61.3 mm' },
    { size: '24', dia: '20.1 mm', circ: '63.2 mm' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#281C18]/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-[#FFF9F0] w-full max-w-2xl max-h-[90vh] rounded-3xl border border-[#E9D9C5] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#FFFFFF] border-b border-[#E9D9C5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F4E4C8] rounded-xl text-[#7A1822]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#281C18]">
                Royal Sizing & Fit Guide
              </h3>
              <p className="text-xs text-[#796A65]">
                Accurate Indian sizing standards for gold rings, chains, and sacred maalas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#796A65] hover:text-[#7A1822] hover:bg-[#F4E4C8] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E9D9C5] bg-[#FFF9F0] px-4 pt-2 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('RING')}
            className={`px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'RING'
                ? 'border-[#7A1822] text-[#7A1822]'
                : 'border-transparent text-[#796A65] hover:text-[#281C18]'
            }`}
          >
            Ring Size Chart
          </button>
          <button
            onClick={() => setActiveTab('CHAIN')}
            className={`px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'CHAIN'
                ? 'border-[#7A1822] text-[#7A1822]'
                : 'border-transparent text-[#796A65] hover:text-[#281C18]'
            }`}
          >
            Chain & Maala Lengths
          </button>
          <button
            onClick={() => setActiveTab('CALCULATOR')}
            className={`px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'CALCULATOR'
                ? 'border-[#7A1822] text-[#7A1822]'
                : 'border-transparent text-[#796A65] hover:text-[#281C18]'
            }`}
          >
            Size Calculator
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'RING' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#B8893D] shrink-0" />
                <p className="text-xs text-[#281C18] leading-relaxed">
                  <strong>How to measure:</strong> Take a thin string or paper strip, wrap it around the base of your finger, mark where it overlaps, and measure the length in mm with a ruler. Match the circumference below!
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#E9D9C5] bg-[#FFFFFF]">
                <table className="w-full text-xs text-left text-[#281C18]">
                  <thead className="bg-[#F4E4C8] text-[#7A1822] font-serif uppercase tracking-wider font-bold border-b border-[#E9D9C5]">
                    <tr>
                      <th className="px-4 py-2.5">Indian Ring Size</th>
                      <th className="px-4 py-2.5">Inside Diameter (mm)</th>
                      <th className="px-4 py-2.5">Circumference (mm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9D9C5]">
                    {ringSizes.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FFF9F0]">
                        <td className="px-4 py-2 font-bold text-[#7A1822]">Size {row.size}</td>
                        <td className="px-4 py-2">{row.dia}</td>
                        <td className="px-4 py-2">{row.circ}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'CHAIN' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl space-y-1">
                  <span className="font-bold text-[#7A1822] text-sm block">16 Inches (Choker / Collar)</span>
                  <p className="text-[#796A65]">Sits snug around the base of the neck. Ideal for high necklines and bridal chokers.</p>
                </div>
                <div className="p-4 bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl space-y-1">
                  <span className="font-bold text-[#7A1822] text-sm block">18 Inches (Princess Length)</span>
                  <p className="text-[#796A65]">Sits near the collarbone. The most versatile length for gold pendants and everyday wear.</p>
                </div>
                <div className="p-4 bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl space-y-1">
                  <span className="font-bold text-[#7A1822] text-sm block">20 to 24 Inches (Matinee / Opera)</span>
                  <p className="text-[#796A65]">Falls over the bust or top of saree blouse. Elegant for heavy temple pendants & men's solid chains.</p>
                </div>
                <div className="p-4 bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl space-y-1">
                  <span className="font-bold text-[#7A1822] text-sm block">28 to 32 Inches (Sacred Maala)</span>
                  <p className="text-[#796A65]">Traditional length for 108-bead Sphatika, Rudraksha, and pearls worn close to the heart chakra.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CALCULATOR' && (
            <div className="space-y-4 bg-[#FFFFFF] p-5 rounded-2xl border border-[#E9D9C5]">
              <h4 className="font-serif font-bold text-sm text-[#7A1822]">
                Instant Ring Size Calculator
              </h4>
              <p className="text-xs text-[#796A65]">
                If you have an existing ring that fits comfortably, measure its inside diameter in millimeters using a ruler and enter it below:
              </p>
              <form onSubmit={handleCalculate} className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    value={mmInput}
                    onChange={(e) => setMmInput(e.target.value)}
                    placeholder="e.g. 17.0"
                    className="flex-1 bg-[#FFF9F0] border border-[#E9D9C5] rounded-xl px-3 py-2 text-xs text-[#281C18] focus:outline-none focus:border-[#7A1822]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#7A1822] text-[#FFF9F0] text-xs font-bold rounded-xl uppercase tracking-wider"
                  >
                    Calculate
                  </button>
                </div>
              </form>

              {calculatedSize && (
                <div className="p-3 bg-[#F4E4C8]/50 border border-[#B8893D]/30 rounded-xl flex items-center gap-2 text-xs font-bold text-[#281C18]">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
                  <span>{calculatedSize}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4E4C8]/40 border-t border-[#E9D9C5] flex items-center justify-between text-xs text-[#796A65]">
          <span>Unsure about your size? We offer complimentary ring resizing within 30 days of purchase.</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#281C18] text-[#FFF9F0] text-xs font-bold rounded-xl"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
