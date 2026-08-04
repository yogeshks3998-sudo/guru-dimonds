import { create } from 'zustand';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { productApi } from '../services/productApi';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
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
  hydrateProducts: () => Promise<void>;
  
  // Product Admin Operations
  addProduct: (product: Product) => Promise<Product>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product | null>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: INITIAL_PRODUCTS,
  loading: false,
  error: null,
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

  hydrateProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await productApi.listProducts();
      set({ products, loading: false });
    } catch (error) {
      set({
        products: get().products.length ? get().products : INITIAL_PRODUCTS,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load products from API',
      });
    }
  },

  addProduct: async (newProd) => {
    set({ products: [newProd, ...get().products] });
    try {
      const saved = await productApi.createProduct(newProd);
      set({ products: get().products.map((p) => (p.id === newProd.id ? saved : p)) });
      return saved;
    } catch (error) {
      set({ products: get().products.filter((p) => p.id !== newProd.id) });
      set({ error: error instanceof Error ? error.message : 'Unable to save product' });
      throw error;
    }
  },

  updateProduct: async (id, updated) => {
    const nextProduct = get().products.find((p) => p.id === id);
    const merged = nextProduct ? { ...nextProduct, ...updated, updatedAt: new Date().toISOString() } : null;
    const previousProducts = get().products;
    if (!merged) throw new Error('Product not found');

    set({
      products: previousProducts.map((p) => (p.id === id ? merged : p)),
    });

    try {
      const saved = await productApi.updateProduct(id, merged);
      set({ products: get().products.map((p) => (p.id === id ? saved : p)) });
      return saved;
    } catch (error) {
      set({
        products: previousProducts,
        error: error instanceof Error ? error.message : 'Unable to update product',
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    const previousProducts = get().products;
    set({ products: previousProducts.filter((p) => p.id !== id) });
    try {
      await productApi.deleteProduct(id);
    } catch (error) {
      set({ products: previousProducts });
      set({ error: error instanceof Error ? error.message : 'Unable to delete product' });
      throw error;
    }
  },

  duplicateProduct: async (id) => {
    const target = get().products.find((p) => p.id === id);
    if (!target) return null;
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
    try {
      const saved = await productApi.createProduct(duplicated);
      set({ products: get().products.map((p) => (p.id === duplicated.id ? saved : p)) });
      return saved;
    } catch (error) {
      set({ products: get().products.filter((p) => p.id !== duplicated.id) });
      set({ error: error instanceof Error ? error.message : 'Unable to duplicate product' });
      throw error;
    }
  },
}));
