import React, { useState, useMemo } from 'react';
import { useProductStore } from '../stores/useProductStore';
import { useMetalRateStore } from '../stores/useMetalRateStore';
import { ProductCard } from '../components/storefront/ProductCard';
import { calculateJewelleryPrice } from '../utils/pricing';
import { productMatchesCategory } from '../utils/productFilters';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { SlidersHorizontal, X, Search, RotateCcw, LayoutGrid, List } from 'lucide-react';

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
    priceRange,
    sortBy,
    setSortBy,
    resetFilters,
  } = useProductStore();

  const { getRate } = useMetalRateStore();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate live price for filtering & sorting
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

      // 2. Category
      if (selectedCategory && !productMatchesCategory(product, selectedCategory)) {
        return false;
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

      // 7. Price Range
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
    selectedCategory,
    selectedSubcategory,
    selectedCollection,
    selectedMetal,
    selectedGender,
    priceRange,
    getRate,
  ]);

  // Sort Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'NEWEST') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'PRICE_LOW_HIGH') {
      list.sort((a, b) => a.grossWeightGrams - b.grossWeightGrams);
    } else if (sortBy === 'PRICE_HIGH_LOW') {
      list.sort((a, b) => b.grossWeightGrams - a.grossWeightGrams);
    } else if (sortBy === 'RATING') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [filteredProducts, sortBy]);

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedCollection,
    selectedMetal,
    selectedGender,
  ].filter(Boolean).length;

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Title */}
      <div className="space-y-2 border-b border-[#E7E1D7] pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B1A18]">Gemstones & Silver Jewellery Catalogue</h1>
        <p className="text-xs sm:text-sm text-[#6F6A62]">
          Browse 100% BIS Hallmarked 925 Sterling Silver, Certified Gemstones, 1-24 Mukhi Rudrakshas, and Devotional Silver Idols.
        </p>
      </div>

      {/* Control Bar: Filters, Search, Sort & Views */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 border border-[#E7E1D7] rounded-2xl shadow-sm">
        {/* Mobile / Desktop Filter Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FAF8F3] hover:bg-[#FAF3E6] border border-[#E7E1D7] text-[#1B1A18] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#A67C32]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-[#A67C32] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <span className="text-xs text-[#6F6A62]">
            Showing <strong>{sortedProducts.length}</strong> creations
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6F6A62] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search silver rings, maalas, gemstones, rudrakshas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
          />
        </div>

        {/* Sorting Dropdown & View Mode */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#A67C32] text-white' : 'text-[#6F6A62]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#A67C32] text-white' : 'text-[#6F6A62]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl text-xs">
          <span className="font-bold text-[#A67C32] uppercase text-[10px] tracking-wider">Active Filters:</span>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]">
              Cat: {selectedCategory}
              <button onClick={() => setSelectedCategory(null)} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedMetal && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]">
              Metal: {selectedMetal}
              <button onClick={() => setSelectedMetal(null)} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedGender && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]">
              Gender: {selectedGender}
              <button onClick={() => setSelectedGender(null)} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#E7E1D7] px-2.5 py-1 rounded-full text-[#1B1A18]">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-[#B43C3C]">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-[11px] font-bold text-[#B43C3C] underline hover:text-[#900] ml-auto flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset All Filters
          </button>
        </div>
      )}

      {/* Main Grid + Filter Sidebar Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop) / Drawer toggleable */}
        <div className={`${filterDrawerOpen ? 'block' : 'hidden lg:block'} space-y-6 lg:col-span-1`}>
          <div className="bg-white p-5 border border-[#E7E1D7] rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D7]">
              <h3 className="font-serif font-bold text-base text-[#1B1A18]">Filter By</h3>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-[#A67C32] font-semibold hover:underline">
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B1A18]">Category</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left py-1 px-2 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-[#FAF3E6] font-bold text-[#A67C32]' : 'text-[#6F6A62] hover:bg-[#FAF8F3]'
                  }`}
                >
                  All Categories
                </button>
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                    className={`block w-full text-left py-1 px-2 rounded-lg transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-[#FAF3E6] font-bold text-[#A67C32]'
                        : 'text-[#6F6A62] hover:bg-[#FAF8F3]'
                    }`}
                  >
                    {cat.name} ({cat.itemCount})
                  </button>
                ))}
              </div>
            </div>

            {/* Metal Type Filter */}
            <div className="space-y-2 pt-4 border-t border-[#E7E1D7]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B1A18]">Metal Type</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {['Silver'].map((metal) => (
                  <button
                    key={metal}
                    onClick={() => setSelectedMetal(selectedMetal === metal ? null : metal)}
                    className={`py-1.5 px-3 border rounded-lg font-medium text-center transition-all ${
                      selectedMetal === metal
                        ? 'bg-[#A67C32] text-white border-[#A67C32]'
                        : 'bg-[#FAF8F3] text-[#1B1A18] border-[#E7E1D7] hover:border-[#A67C32]'
                    }`}
                  >
                    925 Sterling Silver
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2 pt-4 border-t border-[#E7E1D7]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B1A18]">Gender & Wear</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Women', 'Men', 'Unisex', 'Kids'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(selectedGender === g ? null : g)}
                    className={`py-1.5 px-3 border rounded-lg font-medium text-center transition-all ${
                      selectedGender === g
                        ? 'bg-[#A67C32] text-white border-[#A67C32]'
                        : 'bg-[#FAF8F3] text-[#1B1A18] border-[#E7E1D7] hover:border-[#A67C32]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Listing */}
        <div className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-12 text-center space-y-4">
              <Search className="w-12 h-12 text-[#A67C32] mx-auto opacity-50" />
              <h3 className="font-serif font-bold text-xl text-[#1B1A18]">No Jewellery Matches Your Filter</h3>
              <p className="text-xs text-[#6F6A62] max-w-sm mx-auto">
                Try widening your price range or resetting selected metal/category filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#A67C32] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
