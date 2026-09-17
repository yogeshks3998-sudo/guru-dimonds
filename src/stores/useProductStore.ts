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

const STORAGE_KEY = 'guru_diamonds_products_v2';

function loadLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // ignore parse error
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(prods: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prods));
  } catch {
    // ignore quota error
  }
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: loadLocalProducts(),
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
      const serverProducts = await productApi.listProducts();
      if (serverProducts && serverProducts.length > 0) {
        const local = get().products;
        const localMap = new Map(local.map((p) => [p.id, p]));

        // Merge server products with local toggle status / enabled states
        const merged = serverProducts.map((sp) => {
          const matched = localMap.get(sp.id);
          return {
            ...sp,
            status: matched?.status !== undefined ? matched.status : sp.status,
            enabled: matched?.enabled !== undefined ? matched.enabled : (sp.enabled !== undefined ? sp.enabled : sp.status === 'ACTIVE'),
          };
        });

        // Retain any locally added products not on server
        const serverIds = new Set(serverProducts.map((s) => s.id));
        const extraLocal = local.filter((l) => !serverIds.has(l.id));
        const finalProducts = [...merged, ...extraLocal];

        saveLocalProducts(finalProducts);
        set({ products: finalProducts, loading: false });
      } else {
        const fallback = get().products.length ? get().products : INITIAL_PRODUCTS;
        saveLocalProducts(fallback);
        set({ products: fallback, loading: false });
      }
    } catch (error) {
      const fallback = get().products.length ? get().products : INITIAL_PRODUCTS;
      set({
        products: fallback,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load products from API',
      });
    }
  },

  addProduct: async (newProd) => {
    const updated = [newProd, ...get().products];
    saveLocalProducts(updated);
    set({ products: updated });
    try {
      const saved = await productApi.createProduct(newProd);
      const synced = get().products.map((p) => (p.id === newProd.id ? saved : p));
      saveLocalProducts(synced);
      set({ products: synced });
      return saved;
    } catch (error) {
      console.warn('Product created locally (API sync skipped):', error);
      return newProd;
    }
  },

  updateProduct: async (id, updatedFields) => {
    const nextProduct = get().products.find((p) => p.id === id);
    if (!nextProduct) throw new Error('Product not found');
    const merged: Product = { ...nextProduct, ...updatedFields, updatedAt: new Date().toISOString() };

    // Synchronize variant pricing and weights so variants don't retain stale disconnected values
    if (merged.variants && merged.variants.length > 0) {
      merged.variants = merged.variants.map((v) => ({
        ...v,
        price: updatedFields.fixedPrice !== undefined ? updatedFields.fixedPrice : (merged.fixedPrice || v.price),
        compareAtPrice: updatedFields.compareAtPrice !== undefined ? updatedFields.compareAtPrice : (merged.compareAtPrice || v.compareAtPrice),
        netWeightGrams: updatedFields.netWeightGrams !== undefined ? updatedFields.netWeightGrams : (merged.netWeightGrams || v.netWeightGrams),
        grossWeightGrams: updatedFields.grossWeightGrams !== undefined ? updatedFields.grossWeightGrams : (merged.grossWeightGrams || v.grossWeightGrams),
      }));
    }

    const updatedProducts = get().products.map((p) => (p.id === id ? merged : p));

    saveLocalProducts(updatedProducts);
    set({ products: updatedProducts });

    try {
      const saved = await productApi.updateProduct(id, merged);
      const synced = get().products.map((p) => (p.id === id ? saved : p));
      saveLocalProducts(synced);
      set({ products: synced });
      return saved;
    } catch (error) {
      console.warn('Product updated locally (API sync skipped):', error);
      return merged;
    }
  },

  deleteProduct: async (id) => {
    const updated = get().products.filter((p) => p.id !== id);
    saveLocalProducts(updated);
    set({ products: updated });
    try {
      await productApi.deleteProduct(id);
    } catch (error) {
      console.warn('Product deleted locally (API sync skipped):', error);
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
    const updated = [duplicated, ...get().products];
    saveLocalProducts(updated);
    set({ products: updated });
    try {
      const saved = await productApi.createProduct(duplicated);
      const synced = get().products.map((p) => (p.id === duplicated.id ? saved : p));
      saveLocalProducts(synced);
      set({ products: synced });
      return saved;
    } catch (error) {
      console.warn('Product duplicated locally (API sync skipped):', error);
      return duplicated;
    }
  },
}));
