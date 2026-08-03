import React, { useState, useEffect, useRef } from 'react';
import { navigateTo } from '../../utils/navigation';
import { useProductStore } from '../../stores/useProductStore';
import { calculateJewelleryPrice } from '../../utils/pricing';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { Search, X, TrendingUp, History, ArrowRight, Sparkles, Gem, ShieldCheck } from 'lucide-react';

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'vedaara_recent_searches_v1';
const TRENDING_KEYWORDS = [
  '22K Gold Ring',
  'Polki Choker',
  'Sphatika Maala',
  '925 Silver Jhumkas',
  'Certified Ruby Gemstone',
  'Temple Gold Kada',
  'Solitaire Ring',
  'Bridal Jewellery Set',
];

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { products, setSearchQuery, setSelectedCategory, setSelectedCollection } = useProductStore();
  const getRate = useMetalRateStore((state) => state.getRate);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      // ignore error
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const filtered = recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSelectSearch = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    setSearchQuery(term);
    onClose();
    navigateTo('/shop');
  };

  const cleanQuery = query.trim().toLowerCase();

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
        .slice(0, 6)
    : [];

  const matchedCategories = cleanQuery
    ? Array.from(new Set(products.map((p) => p.category))).filter((cat) => cat.toLowerCase().includes(cleanQuery))
    : [];

  const matchedGemstones = cleanQuery
    ? Array.from(
        new Set(
          products.flatMap((p) => p.gemstones.map((g) => g.type))
        )
      ).filter((gem) => gem.toLowerCase().includes(cleanQuery))
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-[#281C18]/60 backdrop-blur-md flex flex-col justify-start pt-12 sm:pt-20 px-4 animate-fadeIn">
      <div className="max-w-4xl w-full mx-auto bg-[#FFF9F0] rounded-3xl border border-[#E9D9C5] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header Input Bar */}
        <div className="p-4 sm:p-6 border-b border-[#E9D9C5] bg-[#FFFFFF] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#B8893D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 22K Gold, Polki, Sphatika, Emerald, SKUs..."
            className="w-full bg-transparent border-none text-sm sm:text-base text-[#281C18] placeholder-[#796A65] focus:outline-none font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleSelectSearch(query);
              }
              if (e.key === 'Escape') onClose();
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-semibold text-[#796A65] hover:text-[#7A1822] px-2 py-1 bg-[#FFF9F0] rounded-lg"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-[#796A65] hover:text-[#7A1822] hover:bg-[#F4E4C8]/50 rounded-xl transition-colors shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Overlay Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {!cleanQuery ? (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E9D9C5]/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#796A65] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#B8893D]" /> Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] font-semibold text-[#7A1822] hover:underline"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSearch(term)}
                        className="text-xs px-3 py-1.5 bg-[#FFFFFF] border border-[#E9D9C5] rounded-full text-[#281C18] hover:border-[#B8893D] hover:bg-[#F4E4C8]/40 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#796A65] flex items-center gap-1.5 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-[#7A1822]" /> Trending Creations
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_KEYWORDS.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSearch(kw)}
                      className="text-xs px-3.5 py-1.5 bg-[#F4E4C8]/50 border border-[#E9D9C5] rounded-full text-[#281C18] font-semibold hover:bg-[#7A1822] hover:text-[#FFF9F0] hover:border-[#7A1822] transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#B8893D]" />
                      <span>{kw}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Category Discovery */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#796A65] block mb-3">
                  Quick Category Suggestions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Gold Rings', cat: 'Gold rings' },
                    { name: 'Sphatika Maalas', cat: 'Maalas' },
                    { name: 'Certified Gemstones', cat: 'Gemstones' },
                    { name: 'Silver Jhumkas', cat: 'Earrings' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedCategory(item.cat);
                        onClose();
                        navigateTo('/shop');
                      }}
                      className="p-3 bg-[#FFFFFF] border border-[#E9D9C5] rounded-xl text-left hover:border-[#B8893D] transition-all group"
                    >
                      <span className="text-xs font-serif font-bold text-[#281C18] group-hover:text-[#7A1822] block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#796A65] mt-0.5 block flex items-center gap-1">
                        Explore <ArrowRight className="w-2.5 h-2.5 text-[#B8893D]" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product Matches */}
              {filteredProducts.length > 0 ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#796A65] block mb-3">
                    Matching Creations ({filteredProducts.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredProducts.map((p) => {
                      const rate = getRate(p.metalType, p.metalPurity);
                      const breakdown = calculateJewelleryPrice({
                        pricingMode: p.pricingMode,
                        fixedPrice: p.fixedPrice,
                        metalType: p.metalType,
                        purity: p.metalPurity,
                        netWeightGrams: p.netWeightGrams,
                        ratePerGram: rate,
                        makingChargeType: p.makingChargeType,
                        makingChargeValue: p.makingChargeValue,
                        wastagePercentage: p.wastagePercentage,
                        gemstones: p.gemstones,
                        certificationCharge: p.certificationCharge,
                        packagingCharge: p.packagingCharge,
                        gstPercentage: p.gstPercentage,
                      });

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            saveRecentSearch(p.name);
                            onClose();
                            navigateTo(`/product/${p.slug}`);
                          }}
                          className="flex items-center gap-3 p-2.5 bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl hover:border-[#B8893D] hover:shadow-md transition-all cursor-pointer group"
                        >
                          <ImageWithFallback
                            src={p.images[0]}
                            alt={p.name}
                            className="w-14 h-14 object-cover rounded-xl bg-[#FFF9F0] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#B8893D] block">
                              {p.metalPurity} {p.metalType} • {p.category}
                            </span>
                            <h4 className="text-xs font-bold text-[#281C18] group-hover:text-[#7A1822] truncate">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-extrabold text-[#7A1822]">
                                ₹{breakdown.finalPrice.toLocaleString('en-IN')}
                              </span>
                              {p.hallmarked && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#2E7D5B] bg-[#2E7D5B]/10 px-1.5 py-0.5 rounded-full">
                                  <ShieldCheck className="w-2.5 h-2.5" /> BIS
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm font-bold text-[#281C18]">No exact creations found for "{query}"</p>
                  <p className="text-xs text-[#796A65]">
                    Try searching for metal types (e.g. 22K Gold, 925 Silver) or gemstone names (Emerald, Rudraksha).
                  </p>
                  <button
                    onClick={() => handleSelectSearch(query)}
                    className="mt-2 px-6 py-2 bg-[#7A1822] text-[#FFF9F0] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md"
                  >
                    View All Results for "{query}"
                  </button>
                </div>
              )}

              {/* Matched Categories & Gemstones */}
              {(matchedCategories.length > 0 || matchedGemstones.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E9D9C5]">
                  {matchedCategories.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#796A65] block mb-2">
                        Categories
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {matchedCategories.map((cat, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedCategory(cat);
                              onClose();
                              navigateTo('/shop');
                            }}
                            className="text-xs px-3 py-1 bg-[#F4E4C8] text-[#281C18] font-bold rounded-lg hover:bg-[#7A1822] hover:text-[#FFF9F0] transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedGemstones.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#796A65] block mb-2 flex items-center gap-1">
                        <Gem className="w-3 h-3 text-[#B8893D]" /> Gemstones
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {matchedGemstones.map((gem, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectSearch(gem)}
                            className="text-xs px-3 py-1 bg-[#FFFFFF] border border-[#E9D9C5] text-[#281C18] font-semibold rounded-lg hover:border-[#B8893D] transition-colors"
                          >
                            {gem}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer View All Search Bar */}
        <div className="p-4 bg-[#F4E4C8]/40 border-t border-[#E9D9C5] flex items-center justify-between text-xs text-[#796A65]">
          <span>Press ESC to close or ENTER to view full catalogue results</span>
          {query && (
            <button
              onClick={() => handleSelectSearch(query)}
              className="font-bold text-[#7A1822] hover:underline flex items-center gap-1"
            >
              <span>See All Shop Results</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B8893D]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
