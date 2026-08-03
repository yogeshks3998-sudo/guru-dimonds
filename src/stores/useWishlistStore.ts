import { create } from 'zustand';
import { Product } from '../types';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const LOCAL_KEY = 'vedaara_wishlist_ids';

const getInitialWishlist = (): string[] => {
  try {
    const d = localStorage.getItem(LOCAL_KEY);
    return d ? JSON.parse(d) : ['prod-1', 'prod-3']; // Default sample items
  } catch {
    return ['prod-1', 'prod-3'];
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: getInitialWishlist(),

  toggleWishlist: (productId) => {
    const current = get().wishlistIds;
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    } catch {}
    set({ wishlistIds: updated });
  },

  isInWishlist: (productId) => {
    return get().wishlistIds.includes(productId);
  },

  clearWishlist: () => {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {}
    set({ wishlistIds: [] });
  },
}));

interface CompareState {
  compareProducts: Product[];
  addToCompare: (product: Product) => { success: boolean; message: string };
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  compareProducts: [],

  addToCompare: (product) => {
    const current = get().compareProducts;
    if (current.some((p) => p.id === product.id)) {
      return { success: false, message: 'Item is already in comparison list.' };
    }
    if (current.length >= 4) {
      return { success: false, message: 'You can compare a maximum of 4 products at once.' };
    }
    set({ compareProducts: [...current, product] });
    return { success: true, message: 'Added to comparison list.' };
  },

  removeFromCompare: (productId) => {
    set({ compareProducts: get().compareProducts.filter((p) => p.id !== productId) });
  },

  clearCompare: () => {
    set({ compareProducts: [] });
  },
}));
