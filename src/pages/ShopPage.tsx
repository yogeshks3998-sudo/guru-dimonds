import React, { useState, useMemo, useEffect } from 'react';
import { useProductStore } from '../stores/useProductStore';
import { useMetalRateStore } from '../stores/useMetalRateStore';
import { ProductCard } from '../components/storefront/ProductCard';
import { calculateJewelleryPrice } from '../utils/pricing';
import { productMatchesCategory } from '../utils/productFilters';
import { useCategoryStore } from '../stores/useCategoryStore';
import { Product } from '../types';
import {
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Check,
  Sparkles,
} from 'lucide-react';
import { navigateTo } from '../utils/navigation';

const ITEMS_PER_PAGE = 24;

const GEMSTONE_OPTIONS = [
  'Ruby',
  'Emerald',
  'Sapphire',
  'Pearl',
  'Citrine',
  'Amethyst',
  'No Gemstone',
];

const OCCASION_OPTIONS = [
  'Daily Wear',
  'Festive',
  'Wedding',
  'Gift',
  'Traditional',
  'Modern',
];

const AVAILABILITY_OPTIONS = [
  'In Stock',
  'Out of Stock',
];

export const ShopPage: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedCollection,
    setSelectedCollection,
    selectedMetal,
    setSelectedMetal,
    selectedGender,
    setSelectedGender,
    sortBy,
    setSortBy,
    resetFilters: resetStoreFilters,
  } = useProductStore();

  const { getRate } = useMetalRateStore();
  const { categories } = useCategoryStore();

  // Local filter states for multi-select matching Image 1
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedCategory ? [selectedCategory] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedGemstones, setSelectedGemstones] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    gemstone: true,
    occasion: true,
    availability: true,
  });

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync selectedCategory from URL or global store
  useEffect(() => {
    if (selectedCategory && !selectedCategories.includes(selectedCategory)) {
      setSelectedCategories([selectedCategory]);
    }
  }, [selectedCategory]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeCategories = useMemo(
    () => categories.filter((c) => c.enabled !== false),
    [categories]
  );

  // Dynamic product count for each category
  const getCategoryCount = (categoryName: string) => {
    return products.filter((p) => productMatchesCategory(p, categoryName)).length;
  };

  // Toggle handlers for multi-select
  const toggleCategory = (catName: string) => {
    setCurrentPage(1);
    setSelectedCategories((prev) => {
      const next = prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName];
      if (next.length === 1) setSelectedCategory(next[0]);
      else if (next.length === 0) setSelectedCategory(null);
      return next;
    });
  };

  const toggleGemstone = (gem: string) => {
    setCurrentPage(1);
    setSelectedGemstones((prev) =>
      prev.includes(gem) ? prev.filter((g) => g !== gem) : [...prev, gem]
    );
  };

  const toggleOccasion = (occ: string) => {
    setCurrentPage(1);
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const toggleAvailability = (avail: string) => {
    setCurrentPage(1);
    setSelectedAvailability((prev) =>
      prev.includes(avail) ? prev.filter((a) => a !== avail) : [...prev, avail]
    );
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedCollection(null);
    setSelectedMetal(null);
    setSelectedGender(null);
    setSelectedGemstones([]);
    setSelectedOccasions([]);
    setSelectedAvailability([]);
    setPriceRange([0, 100000]);
    setSearchQuery('');
    resetStoreFilters();
    setCurrentPage(1);
  };

  // Helper matching gemstone
  const matchesGemstone = (product: Product, selectedGems: string[]): boolean => {
    if (selectedGems.length === 0) return true;
    return selectedGems.some((gem) => {
      if (gem === 'No Gemstone') {
        const hasGemstones = product.gemstones && product.gemstones.length > 0;
        const nameMentionsGem = /ruby|emerald|sapphire|pearl|citrine|amethyst|gemstone|navarathna/i.test(
          product.name
        );
        return !hasGemstones && !nameMentionsGem;
      }
      const target = gem.toLowerCase();
      const inGemstones = product.gemstones?.some(
        (g) => g.type?.toLowerCase().includes(target) || g.color?.toLowerCase().includes(target)
      );
      const inName = product.name.toLowerCase().includes(target);
      const inTags = product.tags?.some((t) => t.toLowerCase().includes(target));
      const inSub = product.subcategory?.toLowerCase().includes(target);
      return inGemstones || inName || inTags || inSub;
    });
  };

  // Helper matching occasion
  const matchesOccasion = (product: Product, selectedOccs: string[]): boolean => {
    if (selectedOccs.length === 0) return true;
    return selectedOccs.some((occ) => {
      const target = occ.toLowerCase();
      const inOccasion = product.occasion?.some((o) => o.toLowerCase().includes(target));
      const inDesc = product.description?.toLowerCase().includes(target);
      const inTags = product.tags?.some((t) => t.toLowerCase().includes(target));
      return inOccasion || inDesc || inTags;
    });
  };

  // Helper matching availability
  const matchesAvailability = (product: Product, selectedAvail: string[]): boolean => {
    if (selectedAvail.length === 0) return true;
    return selectedAvail.some((avail) => {
      if (avail === 'In Stock') return product.totalStock > 0;
      if (avail === 'Out of Stock') return product.totalStock <= 0;
      return true;
    });
  };

  // Calculate live price and filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesTags = product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesTags) return false;
      }

      // 2. Category (multi-select supported)
      if (selectedCategories.length > 0) {
        const matchesAnyCat = selectedCategories.some((cat) =>
          productMatchesCategory(product, cat)
        );
        if (!matchesAnyCat) return false;
      }

      // 3. Subcategory
      if (selectedSubcategory && product.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) {
        return false;
      }

      // 4. Collection
      if (selectedCollection && product.collection !== selectedCollection) {
        return false;
      }

      // 5. Metal
      if (selectedMetal && product.metalType.toLowerCase() !== selectedMetal.toLowerCase()) {
        return false;
      }

      // 6. Gender
      if (selectedGender && product.gender.toLowerCase() !== selectedGender.toLowerCase()) {
        return false;
      }

      // 7. Gemstones
      if (!matchesGemstone(product, selectedGemstones)) {
        return false;
      }

      // 8. Occasion
      if (!matchesOccasion(product, selectedOccasions)) {
        return false;
      }

      // 9. Availability
      if (!matchesAvailability(product, selectedAvailability)) {
        return false;
      }

      // 10. Live Price Range
      const currentRate = getRate(product.metalType, product.metalPurity);
      const calcPrice = calculateJewelleryPrice({
        pricingMode: product.pricingMode,
        fixedPrice: product.fixedPrice,
        metalType: product.metalType,
        purity: product.metalPurity,
        netWeightGrams: product.netWeightGrams,
        ratePerGram: currentRate,
        makingChargeType: product.makingChargeType,
        makingChargeValue: product.makingChargeValue,
        wastagePercentage: product.wastagePercentage,
        gemstones: product.gemstones,
        certificationCharge: product.certificationCharge,
        packagingCharge: product.packagingCharge,
        gstPercentage: product.gstPercentage,
      }).finalPrice;

      if (calcPrice < priceRange[0] || calcPrice > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedSubcategory,
    selectedCollection,
    selectedMetal,
    selectedGender,
    selectedGemstones,
    selectedOccasions,
    selectedAvailability,
    priceRange,
    getRate,
  ]);

  // Helper to compute live final price for accurate sorting
  const getProductLivePrice = (p: Product) => {
    const rate = getRate(p.metalType, p.metalPurity);
    return calculateJewelleryPrice({
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
    }).finalPrice;
  };

  // Sort Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'NEWEST') {
      list.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sortBy === 'PRICE_LOW_HIGH') {
      list.sort((a, b) => getProductLivePrice(a) - getProductLivePrice(b));
    } else if (sortBy === 'PRICE_HIGH_LOW') {
      list.sort((a, b) => getProductLivePrice(b) - getProductLivePrice(a));
    } else if (sortBy === 'RATING') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [filteredProducts, sortBy, getRate]);

  // Pagination calculations (Image 2)
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const gridElem = document.getElementById('shop-catalogue-heading');
    if (gridElem) {
      gridElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  // Generate pagination items: e.g. [1, 2, 3, 4, 5, '...', 10]
  const paginationItems = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [totalPages, currentPage]);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    (selectedSubcategory ? 1 : 0) +
    (selectedCollection ? 1 : 0) +
    (selectedMetal ? 1 : 0) +
    (selectedGender ? 1 : 0) +
    selectedGemstones.length +
    selectedOccasions.length +
    selectedAvailability.length +
    (priceRange[0] > 500 || priceRange[1] < 50000 ? 1 : 0);

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Title */}
      <div id="shop-catalogue-heading" className="space-y-2 border-b border-[#E7E1D7] pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B1A18]">
          Gemstones & Silver Jewellery Catalogue
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6A62]">
          Browse 100% BIS Hallmarked 925 Sterling Silver, Certified Gemstones, 1-24 Mukhi Rudrakshas, and Devotional Silver Idols.
        </p>
      </div>

      {/* Control Bar: Mobile Filters, Search, Sort & Views */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 border border-[#E7E1D7] rounded-2xl shadow-xs">
        {/* Mobile / Desktop Filter Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FAF8F3] hover:bg-[#FAF3E6] border border-[#E7E1D7] text-[#1B1A18] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#A67C32]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-[#4A1515] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <span className="text-xs text-[#6F6A62]">
            Showing{' '}
            <strong>
              {sortedProducts.length === 0
                ? 0
                : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  sortedProducts.length
                )}`}
            </strong>{' '}
            of <strong>{sortedProducts.length}</strong> creations
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6F6A62] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search silver rings, maalas, gemstones..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
          />
        </div>

        {/* Sorting Dropdown & View Mode */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs text-[#1B1A18] font-medium focus:outline-none focus:border-[#A67C32]"
          >
            <option value="RECOMMENDED">Sort by: Recommended</option>
            <option value="NEWEST">Sort by: Newest Arrivals</option>
            <option value="PRICE_LOW_HIGH">Sort by: Price (Low to High)</option>
            <option value="PRICE_HIGH_LOW">Sort by: Price (High to Low)</option>
            <option value="RATING">Sort by: Highest Rated</option>
          </select>

          <div className="flex items-center border border-[#E7E1D7] rounded-xl overflow-hidden bg-[#FAF8F3]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#3E1616] text-white' : 'text-[#6F6A62]'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#3E1616] text-white' : 'text-[#6F6A62]'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl text-xs">
          <span className="font-bold text-[#3E1616] uppercase text-[10px] tracking-wider">Active Filters:</span>

          {selectedCategories.map((cat) => (
            <span
              key={`chip-cat-${cat}`}
              className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]"
            >
              {cat}
              <button onClick={() => toggleCategory(cat)} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedGemstones.map((gem) => (
            <span
              key={`chip-gem-${gem}`}
              className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]"
            >
              Gem: {gem}
              <button onClick={() => toggleGemstone(gem)} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedOccasions.map((occ) => (
            <span
              key={`chip-occ-${occ}`}
              className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]"
            >
              Occasion: {occ}
              <button onClick={() => toggleOccasion(occ)} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedAvailability.map((avail) => (
            <span
              key={`chip-avail-${avail}`}
              className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]"
            >
              {avail}
              <button onClick={() => toggleAvailability(avail)} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {(priceRange[0] > 500 || priceRange[1] < 50000) && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]">
              ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
              <button onClick={() => setPriceRange([500, 50000])} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleClearAll}
            className="text-[11px] font-bold text-[#6E2B2B] underline hover:text-[#900] ml-auto flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Main Grid + Filter Sidebar Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative">
        {/* Filter Sidebar (Desktop Sticky / Mobile toggleable) - Exactly matching Image 1 */}
        <aside
          className={`${filterDrawerOpen
              ? 'fixed inset-x-4 top-20 z-50 max-h-[90vh] overflow-y-auto lg:static lg:inset-auto lg:top-auto lg:z-auto lg:max-h-none'
              : 'hidden lg:block'
            } lg:col-span-1 self-start`}
        >
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Header: Filters & Clear All */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D7]">
              <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Filters</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-[#6E2B2B] hover:text-[#3E1616] transition-colors"
                >
                  Clear All
                </button>
                {filterDrawerOpen && (
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-[#6F6A62]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 1. Category Accordion */}
            <div className="border-b border-[#E7E1D7] pb-4 space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="font-sans font-bold text-xs text-[#1B1A18] tracking-wide">Category</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6F6A62] transition-transform duration-200 ${openSections.category ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.category && (
                <div className="space-y-2 pt-1">
                  {activeCategories.map((cat) => {
                    const count = getCategoryCount(cat.name);
                    const isChecked = selectedCategories.includes(cat.name);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center justify-between text-xs text-[#5A524C] hover:text-[#1B1A18] cursor-pointer group py-0.5 select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat.name)}
                            className="w-4 h-4 rounded border-[#D8C29D] text-[#3E1616] focus:ring-0 accent-[#3E1616] cursor-pointer"
                          />
                          <span className={isChecked ? 'font-bold text-[#3E1616]' : 'font-medium'}>
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8C827A] font-normal">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Price Range Accordion */}
            <div className="border-b border-[#E7E1D7] pb-4 space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="font-sans font-bold text-xs text-[#1B1A18] tracking-wide">Price Range</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6F6A62] transition-transform duration-200 ${openSections.price ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.price && (
                <div className="space-y-3 pt-2">
                  {/* Styled Dual Slider Bar */}
                  <div className="relative pt-1 pb-1">
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={500}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPriceRange([priceRange[0], Math.max(priceRange[0] + 500, val)]);
                        setCurrentPage(1);
                      }}
                      className="w-full h-1.5 bg-[#E7E1D7] rounded-lg appearance-none cursor-pointer accent-[#3E1616]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#1B1A18]">
                    <span>₹ {priceRange[0].toLocaleString('en-IN')}</span>
                    <span className="text-[#8C827A] font-normal">—</span>
                    <span>₹ {priceRange[1].toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Gemstone Accordion */}
            <div className="border-b border-[#E7E1D7] pb-4 space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('gemstone')}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="font-sans font-bold text-xs text-[#1B1A18] tracking-wide">Gemstone</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6F6A62] transition-transform duration-200 ${openSections.gemstone ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.gemstone && (
                <div className="space-y-2 pt-1">
                  {GEMSTONE_OPTIONS.map((gem) => {
                    const isChecked = selectedGemstones.includes(gem);
                    return (
                      <label
                        key={gem}
                        className="flex items-center gap-2.5 text-xs text-[#5A524C] hover:text-[#1B1A18] cursor-pointer py-0.5 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleGemstone(gem)}
                          className="w-4 h-4 rounded border-[#D8C29D] text-[#3E1616] focus:ring-0 accent-[#3E1616] cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#3E1616]' : 'font-medium'}>
                          {gem}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Occasion Accordion */}
            <div className="border-b border-[#E7E1D7] pb-4 space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('occasion')}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="font-sans font-bold text-xs text-[#1B1A18] tracking-wide">Occasion</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6F6A62] transition-transform duration-200 ${openSections.occasion ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.occasion && (
                <div className="space-y-2 pt-1">
                  {OCCASION_OPTIONS.map((occ) => {
                    const isChecked = selectedOccasions.includes(occ);
                    return (
                      <label
                        key={occ}
                        className="flex items-center gap-2.5 text-xs text-[#5A524C] hover:text-[#1B1A18] cursor-pointer py-0.5 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOccasion(occ)}
                          className="w-4 h-4 rounded border-[#D8C29D] text-[#3E1616] focus:ring-0 accent-[#3E1616] cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#3E1616]' : 'font-medium'}>
                          {occ}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Availability Accordion */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('availability')}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="font-sans font-bold text-xs text-[#1B1A18] tracking-wide">Availability</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6F6A62] transition-transform duration-200 ${openSections.availability ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.availability && (
                <div className="space-y-2 pt-1">
                  {AVAILABILITY_OPTIONS.map((avail) => {
                    const isChecked = selectedAvailability.includes(avail);
                    return (
                      <label
                        key={avail}
                        className="flex items-center gap-2.5 text-xs text-[#5A524C] hover:text-[#1B1A18] cursor-pointer py-0.5 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAvailability(avail)}
                          className="w-4 h-4 rounded border-[#D8C29D] text-[#3E1616] focus:ring-0 accent-[#3E1616] cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#3E1616]' : 'font-medium'}>
                          {avail}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Custom Jewellery Contact Banner at bottom of filters */}
            <div className="pt-2">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-[#FDF9F2] via-[#FBF4E9] to-[#F7EFE3] border border-[#E7D6C1] shadow-2xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#FAF0DE] border border-[#D8C29D] flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-6 h-6 text-[#A67C32]" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h5 className="font-serif text-xs font-bold text-[#1B1A18] leading-tight">
                    Contact Us for Customised Jewellery
                  </h5>
                  <button
                    type="button"
                    onClick={() => navigateTo('/contact')}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#3E1616] hover:bg-[#2A0F0F] px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    Contact Us &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Cards Listing & Pagination */}
        <div className="lg:col-span-3 space-y-8">
          {sortedProducts.length === 0 ? (
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <Search className="w-12 h-12 text-[#A67C32] mx-auto opacity-50" />
              <h3 className="font-serif font-bold text-xl text-[#1B1A18]">No Jewellery Matches Your Filter</h3>
              <p className="text-xs text-[#6F6A62] max-w-sm mx-auto">
                Try resetting selected categories, price range, or gemstone filters to explore the rest of the collection.
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-2.5 bg-[#3E1616] hover:bg-[#2A0F0F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Cards Grid */}
              <div
                className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                  }`}
              >
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Bar (Image 2) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-xl border border-[#E7E1D7] bg-white hover:bg-[#FAF8F3] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#1B1A18] transition-all shadow-2xs"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  {paginationItems.map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 text-center text-xs font-bold text-[#8C827A]"
                        >
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(item);
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center ${isActive
                            ? 'bg-[#3E1616] text-white shadow-sm scale-105'
                            : 'bg-white hover:bg-[#FAF8F3] text-[#5A524C] hover:text-[#1B1A18] border border-[#E7E1D7]'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-xl border border-[#E7E1D7] bg-white hover:bg-[#FAF8F3] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#1B1A18] transition-all shadow-2xs"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ShopPage;
