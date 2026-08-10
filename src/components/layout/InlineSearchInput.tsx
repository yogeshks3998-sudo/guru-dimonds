import React, { useState, useRef, useEffect } from 'react';
import { navigateTo } from '../../utils/navigation';
import { useProductStore } from '../../stores/useProductStore';
import { Search, X, ArrowRight } from 'lucide-react';

export const InlineSearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { products, setSearchQuery } = useProductStore();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Filter & sort matching products alphabetically (A to Z)
  const filteredProducts = cleanQuery
    ? products
        .filter((p) => {
          const matchName = p.name.toLowerCase().includes(cleanQuery);
          const matchCategory = p.category.toLowerCase().includes(cleanQuery);
          const matchSubcategory = p.subcategory.toLowerCase().includes(cleanQuery);
          const matchSku = p.sku.toLowerCase().includes(cleanQuery);
          const matchMetal = `${p.metalType} ${p.metalPurity}`.toLowerCase().includes(cleanQuery);
          const matchGemstones = p.gemstones.some((g) => g.type.toLowerCase().includes(cleanQuery));
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(cleanQuery));
          return matchName || matchCategory || matchSubcategory || matchSku || matchMetal || matchGemstones || matchTags;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const handleSearchSubmit = (term: string) => {
    if (!term.trim()) return;
    setSearchQuery(term);
    setIsOpen(false);
    navigateTo('/shop');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[460px]">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-[#FFFFFF] border border-[#E9D9C5] focus-within:border-[#B8893D] focus-within:ring-2 focus-within:ring-[#B8893D]/20 rounded-full px-4 py-2 transition-all shadow-xs">
        <Search className="w-4 h-4 text-[#B8893D] shrink-0 mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit(query);
            }
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder="Search rings, Sphatika, Rudraksha, Gemstones..."
          className="w-full bg-transparent border-none text-xs sm:text-sm text-[#281C18] placeholder-[#796A65] focus:outline-none font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 text-[#796A65] hover:text-[#7A1822] transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Directly Attached Dropdown Under Search Bar */}
      {isOpen && cleanQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFFFF] border-2 border-[#E9D9C5] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[380px] overflow-y-auto animate-fadeIn">
          {filteredProducts.length > 0 ? (
            <div className="divide-y divide-[#E9D9C5]/60">
              <div className="px-4 py-2 bg-[#FFF9F0] text-[11px] font-bold text-[#B8893D] uppercase tracking-wider flex items-center justify-between border-b border-[#E9D9C5]">
                <span>Suggested Products ({filteredProducts.length})</span>
                <span>A to Z</span>
              </div>
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setIsOpen(false);
                    navigateTo(`/product/${p.slug}`);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#F4E4C8]/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Search className="w-3.5 h-3.5 text-[#B8893D] shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-xs sm:text-sm font-semibold text-[#281C18] group-hover:text-[#7A1822] truncate">
                      {p.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-bold text-[#7A1822] uppercase tracking-wider bg-[#FFF9F0] px-2 py-0.5 rounded-md border border-[#E9D9C5]">
                      {p.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#796A65] group-hover:text-[#7A1822] group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs font-bold text-[#281C18]">No exact products found for "{query}"</p>
              <button
                onClick={() => handleSearchSubmit(query)}
                className="px-4 py-1.5 bg-[#7A1822] text-[#FFF9F0] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
              >
                Search Full Shop
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
