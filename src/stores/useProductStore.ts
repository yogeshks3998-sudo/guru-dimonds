import { create } from 'zustand';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

interface ProductState {
  products: Product[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  selectedCollection: string | null;
  selectedMetal: string | null;
  selectedGender: string | null;
  priceRange: [number, number];
  sortBy: string;
  
  // Actions
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string | null) => void;
  setSelectedSubcategory: (sub: string | null) => void;
  setSelectedCollection: (col: string | null) => void;
  setSelectedMetal: (metal: string | null) => void;
  setSelectedGender: (gender: string | null) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
  
  // Product Admin Operations
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: INITIAL_PRODUCTS,
  searchQuery: '',
  selectedCategory: null,
  selectedSubcategory: null,
  selectedCollection: null,
  selectedMetal: null,
  selectedGender: null,
  priceRange: [0, 500000],
  sortBy: 'RECOMMENDED',

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat, selectedSubcategory: null }),
  setSelectedSubcategory: (sub) => set({ selectedSubcategory: sub }),
  setSelectedCollection: (col) => set({ selectedCollection: col }),
  setSelectedMetal: (metal) => set({ selectedMetal: metal }),
  setSelectedGender: (gender) => set({ selectedGender: gender }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: null,
      selectedSubcategory: null,
      selectedCollection: null,
      selectedMetal: null,
      selectedGender: null,
      priceRange: [0, 500000],
      sortBy: 'RECOMMENDED',
    }),

  addProduct: (newProd) => {
    set({ products: [newProd, ...get().products] });
  },

  updateProduct: (id, updated) => {
    set({
      products: get().products.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p)),
    });
  },

  deleteProduct: (id) => {
    set({ products: get().products.filter((p) => p.id !== id) });
  },

  duplicateProduct: (id) => {
    const target = get().products.find((p) => p.id === id);
    if (!target) return;
    const duplicated: Product = {
      ...target,
      id: `prod-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy-${Date.now()}`,
      sku: `${target.sku}-CPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ products: [duplicated, ...get().products] });
  },
}));
