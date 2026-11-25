import React from 'react';
import { Ruler } from 'lucide-react';
import type { JewelleryOptionGroup } from '../../utils/jewelleryDetails';

interface JewelleryOptionSelectorProps {
  group: JewelleryOptionGroup;
  selectedValue: string;
  onChange: (value: string) => void;
  onOpenGuide?: () => void;
}

export const JewelleryOptionSelector: React.FC<JewelleryOptionSelectorProps> = ({
  group,
  selectedValue,
  onChange,
  onOpenGuide,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1B1A18] flex items-center gap-1.5">
          <span>{group.name}:</span>
          <span className="text-[#A67C32] font-semibold">{selectedValue || group.defaultOption}</span>
        </label>
        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-xs font-bold text-[#7A1822] hover:text-[#A67C32] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Ruler className="w-3.5 h-3.5 text-[#B8893D]" />
            <span>Size Guide</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => {
          const isSelected = (selectedValue || group.defaultOption) === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#7A1822] text-[#FFF9F0] border-[#7A1822] shadow-sm ring-2 ring-[#7A1822]/20'
                  : 'bg-white text-[#1B1A18] border-[#E7E1D7] hover:border-[#A67C32] hover:bg-[#FAF8F3]'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {group.helperText && (
        <p className="text-[11px] text-[#6F6A62] italic">{group.helperText}</p>
      )}
    </div>
  );
};
