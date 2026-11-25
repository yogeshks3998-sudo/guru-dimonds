import { create } from 'zustand';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { SUPPLIER_PRODUCT_DRAFTS } from '../data/supplierProductBatches';
import {
  supplierPublicationError,
  isSameSupplierProduct,
  mergeMissingSupplierProducts,
  isDemoProduct,
  filterRetainedProducts,
} from '../utils/supplierProducts';
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

const STORAGE_KEY = 'guru_diamonds_products_v8';
const LEGACY_STORAGE_KEYS = [
  'guru_diamonds_products_v7',
  'guru_diamonds_products_v6',
  'guru_diamonds_products_v5',
  'guru_diamonds_products_v4',
  'guru_diamonds_products_v3',
  'guru_diamonds_products_v2',
  'guru_diamonds_products_v1',
  'vedaara_products_v1',
];

function loadLocalProducts(): Product[] {
  try {
    // Thoroughly remove all legacy caches from older versions
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      try {
        localStorage.removeItem(legacyKey);
      } catch {}
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLocalProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleanProducts = filterRetainedProducts(parsed);
      const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));

      // Merge cached products while ensuring real images, active status, and pricing are preserved
      const merged: Product[] = cleanProducts.map((p) => {
        const init = initialMap.get(p.id);
        if (!init) return p;
        const hasOutdatedImages = p.images?.some((img) => img.includes('/products/rings/') || img.includes('/products/earrings/'));
        const isDraftOrMissingImages = !p.images?.length || p.status === 'DRAFT' || p.metalPurity === 'UNVERIFIED' || hasOutdatedImages;
        if (isDraftOrMissingImages) {
          return {
            ...p,
            ...init,
            images: init.images,
            status: 'ACTIVE' as const,
            enabled: true,
            fixedPrice: p.fixedPrice || init.fixedPrice,
            metalColor: init.metalColor,
            metalPurity: init.metalPurity,
            variants: init.variants,
            supplierReview: init.supplierReview,
          };
        }
        return p;
      });

      // Add any missing products from INITIAL_PRODUCTS
      for (const init of INITIAL_PRODUCTS) {
        if (!merged.some((m) => m.id === init.id)) {
          merged.push(init);
        }
      }

      saveLocalProducts(merged);
      return merged;
    }
  } catch {
    // ignore parse error
  }
  saveLocalProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(prods: Product[]): void {
  try {
    const clean = filterRetainedProducts(prods);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
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
      const rawServerProducts = await productApi.listProducts();
      const serverProducts = filterRetainedProducts(rawServerProducts || []);
      if (serverProducts && serverProducts.length > 0) {
        const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
        const local = get().products;
        const localMap = new Map(local.map((p) => [p.id, p]));

        const merged = serverProducts.map((sp) => {
          const matched = localMap.get(sp.id);
          const init = initialMap.get(sp.id);
          const status = matched?.status && matched.status !== 'DRAFT' ? matched.status : sp.status;
          const hasValidMatchedImages = matched?.images && matched.images.length > 0 && !matched.images.some(i => i.includes('/products/rings/') || i.includes('/products/earrings/'));
          const hasValidServerImages = sp.images && sp.images.length > 0 && !sp.images.some(i => i.includes('/products/rings/') || i.includes('/products/earrings/'));
          const images = hasValidMatchedImages ? matched!.images : (hasValidServerImages ? sp.images : init?.images || []);
          return {
            ...sp,
            ...matched,
            status,
            enabled: matched?.enabled !== undefined ? matched.enabled : sp.enabled,
            images,
            fixedPrice: matched?.fixedPrice || sp.fixedPrice || init?.fixedPrice,
            supplierReview: init?.supplierReview || sp.supplierReview,
          };
        });

        saveLocalProducts(merged);
        set({ products: merged, loading: false });
      } else {
        const fallback = get().products.length ? filterRetainedProducts(get().products) : INITIAL_PRODUCTS;
        saveLocalProducts(fallback);
        set({ products: fallback, loading: false });
      }
    } catch (error) {
      const fallback = get().products.length ? filterRetainedProducts(get().products) : INITIAL_PRODUCTS;
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
    if (nextProduct.supplierReview) {
      merged.supplierReview = { ...(updatedFields.supplierReview || nextProduct.supplierReview), raw: nextProduct.supplierReview.raw };
    }
    if (merged.status === 'ACTIVE' || merged.status === 'SCHEDULED') {
      const error = supplierPublicationError(merged);
      if (error) throw new Error(error);
    }

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
