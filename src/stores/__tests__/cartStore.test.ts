import { describe, expect, it, vi } from 'vitest';
import { useCartStore } from '../useCartStore';
import { INITIAL_PRODUCTS } from '../../data/mockProducts';

vi.mock('../useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({ isCustomerLoggedIn: false }),
  },
  hasCustomerApiSession: () => false,
}));

describe('useCartStore guest behavior', () => {
  it('persists guest cart items locally', () => {
    useCartStore.getState().clearCart();
    const purchasable = {
      ...INITIAL_PRODUCTS[0],
      status: 'ACTIVE' as const,
      enabled: true,
      pricingMode: 'FIXED' as const,
      fixedPrice: 5000,
      images: ['/real.jpg'],
      supplierReview: undefined,
    };
    useCartStore.getState().addItem({ product: purchasable, quantity: 2 });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    expect(JSON.parse(localStorage.getItem('guru_diamonds_cart_items_v1') || '[]')).toHaveLength(1);
  });
});
