import { create } from 'zustand';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { calculateJewelleryPrice } from '../utils/pricing';
import { useMetalRateStore } from './useMetalRateStore';
import { INITIAL_COUPONS } from '../data/mockData';
import { couponApi } from '../services/couponApi';
import { cartApi } from '../services/cartApi';
import { useAuthStore } from './useAuthStore';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  coupons: Coupon[];
  couponError: string | null;
  syncError: string | null;
  priceLockExpiresAt: number | null; // Timestamp 15 minutes from first addition
  
  // Actions
  addItem: (params: {
    product: Product;
    variant?: ProductVariant;
    selectedAttributes?: Record<string, string>;
    quantity?: number;
    customEngraving?: string;
    giftWrap?: boolean;
    giftMessage?: string;
  }) => void;
  
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleGiftWrap: (id: string, giftWrap: boolean, giftMessage?: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  hydrateCoupons: () => Promise<void>;
  hydrateCart: () => Promise<void>;
  mergeGuestCartToCustomer: () => Promise<void>;
  
  // Computations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getGSTTotal: () => number;
  getShippingCharge: () => number;
  getTotal: () => number;
}

const LOCAL_STORAGE_KEY = 'guru_diamonds_cart_items_v1';
const LEGACY_LOCAL_STORAGE_KEY = 'vedaara_cart_items_v1';

const getInitialItems = (): CartItem[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
    if (data && !localStorage.getItem(LOCAL_STORAGE_KEY)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, data);
    }
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveItems = (items: CartItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialItems(),
  appliedCoupon: null,
  coupons: INITIAL_COUPONS,
  couponError: null,
  syncError: null,
  priceLockExpiresAt: Date.now() + 15 * 60 * 1000, // 15-min price lock

  hydrateCoupons: async () => {
    try {
      const coupons = await couponApi.listCoupons();
      set({ coupons, couponError: null });
    } catch (error) {
      set({ coupons: INITIAL_COUPONS, couponError: error instanceof Error ? error.message : 'Unable to load coupons' });
    }
  },

  hydrateCart: async () => {
    if (!useAuthStore.getState().isCustomerLoggedIn) return;
    try {
      const cart = await cartApi.getCart();
      saveItems(cart.items);
      set({ items: cart.items, syncError: null });
    } catch (error) {
      set({ syncError: error instanceof Error ? error.message : 'Unable to load customer cart' });
    }
  },

  mergeGuestCartToCustomer: async () => {
    if (!useAuthStore.getState().isCustomerLoggedIn) return;
    const guestItems = get().items;
    try {
      for (const item of guestItems) {
        await cartApi.addItem({
          productId: item.productId,
          variantId: item.variantId,
          selectedAttributes: item.selectedAttributes,
          quantity: item.quantity,
          customEngraving: item.customEngraving,
          giftWrap: item.giftWrap,
          giftMessage: item.giftMessage,
        });
      }
      const cart = await cartApi.getCart();
      saveItems(cart.items);
      set({ items: cart.items, syncError: null });
    } catch (error) {
      set({ syncError: error instanceof Error ? error.message : 'Unable to merge customer cart' });
    }
  },

  addItem: ({ product, variant, selectedAttributes = {}, quantity = 1, customEngraving, giftWrap = false, giftMessage }) => {
    const metalRates = useMetalRateStore.getState();
    const currentRate = metalRates.getRate(product.metalType, product.metalPurity);

    const priceBreakdown = calculateJewelleryPrice({
      pricingMode: product.pricingMode,
      fixedPrice: variant ? variant.price : product.fixedPrice,
      metalType: product.metalType,
      purity: product.metalPurity,
      netWeightGrams: variant ? variant.netWeightGrams : product.netWeightGrams,
      ratePerGram: currentRate,
      makingChargeType: product.makingChargeType,
      makingChargeValue: product.makingChargeValue,
      wastagePercentage: product.wastagePercentage,
      gemstones: product.gemstones,
      certificationCharge: product.certificationCharge,
      packagingCharge: product.packagingCharge,
      gstPercentage: product.gstPercentage,
    });

    const unitPrice = priceBreakdown.finalPrice;
    const existingIndex = get().items.findIndex(
      (item) => item.productId === product.id && item.variantId === (variant?.id || undefined)
    );

    let updatedItems: CartItem[] = [];

    if (existingIndex >= 0) {
      updatedItems = [...get().items];
      updatedItems[existingIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        variantId: variant?.id,
        product,
        selectedVariant: variant,
        selectedAttributes,
        quantity,
        unitPrice,
        priceBreakdown,
        metalRateSnapshot: currentRate,
        customEngraving,
        giftWrap,
        giftMessage,
        addedAt: new Date().toISOString(),
      };
      updatedItems = [...get().items, newItem];
    }

    saveItems(updatedItems);
    set({
      items: updatedItems,
      priceLockExpiresAt: Date.now() + 15 * 60 * 1000,
    });
    if (useAuthStore.getState().isCustomerLoggedIn) {
      void cartApi
        .addItem({
          productId: product.id,
          variantId: variant?.id,
          selectedAttributes,
          quantity,
          customEngraving,
          giftWrap,
          giftMessage,
        })
        .then((cart) => {
          saveItems(cart.items);
          set({ items: cart.items, syncError: null });
        })
        .catch((error) => {
          set({ syncError: error instanceof Error ? error.message : 'Unable to sync cart item' });
        });
    }
  },

  removeItem: (id) => {
    const filtered = get().items.filter((item) => item.id !== id);
    saveItems(filtered);
    set({ items: filtered });
    if (useAuthStore.getState().isCustomerLoggedIn) {
      void cartApi.removeItem(id).catch((error) => {
        set({ syncError: error instanceof Error ? error.message : 'Unable to remove synced cart item' });
      });
    }
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    const updated = get().items.map((item) => (item.id === id ? { ...item, quantity } : item));
    saveItems(updated);
    set({ items: updated });
    if (useAuthStore.getState().isCustomerLoggedIn) {
      void cartApi.updateItem(id, { quantity }).catch((error) => {
        set({ syncError: error instanceof Error ? error.message : 'Unable to update synced cart item' });
      });
    }
  },

  toggleGiftWrap: (id, giftWrap, giftMessage) => {
    const updated = get().items.map((item) => (item.id === id ? { ...item, giftWrap, giftMessage } : item));
    saveItems(updated);
    set({ items: updated });
    if (useAuthStore.getState().isCustomerLoggedIn) {
      void cartApi.updateItem(id, { giftWrap, giftMessage }).catch((error) => {
        set({ syncError: error instanceof Error ? error.message : 'Unable to update gift wrap' });
      });
    }
  },

  applyCoupon: (code) => {
    const cleanCode = code.trim().toUpperCase();
    const found = get().coupons.find((c) => c.code === cleanCode && c.active);

    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    const subtotal = get().getSubtotal();
    if (subtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `Coupon code requires a minimum order amount of ₹${found.minOrderAmount.toLocaleString('en-IN')}.`,
      };
    }

    set({ appliedCoupon: found });
    void couponApi.validateCoupon(cleanCode, subtotal).catch((error) => {
      set({ couponError: error instanceof Error ? error.message : 'Unable to validate coupon with API' });
    });
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
  },

  clearCart: () => {
    saveItems([]);
    set({ items: [], appliedCoupon: null });
    if (useAuthStore.getState().isCustomerLoggedIn) {
      void cartApi.clearCart().catch((error) => {
        set({ syncError: error instanceof Error ? error.message : 'Unable to clear synced cart' });
      });
    }
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const coupon = get().appliedCoupon;
    if (!coupon) return 0;
    const subtotal = get().getSubtotal();

    if (coupon.discountType === 'FIXED') {
      return Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'PERCENTAGE') {
      const calculated = (subtotal * coupon.discountValue) / 100;
      return coupon.maxDiscountAmount ? Math.min(calculated, coupon.maxDiscountAmount) : calculated;
    }
    return 0;
  },

  getGSTTotal: () => {
    return get().items.reduce((sum, item) => {
      const itemGst = item.priceBreakdown.gstAmount * item.quantity;
      return sum + itemGst;
    }, 0);
  },

  getShippingCharge: () => {
    const subtotal = get().getSubtotal();
    if (subtotal >= 2000 || get().appliedCoupon?.discountType === 'FREE_SHIPPING') {
      return 0;
    }
    return 250; // Insured shipping fee for lower order values
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingCharge();
    return Math.max(0, subtotal - discount + shipping);
  },
}));
