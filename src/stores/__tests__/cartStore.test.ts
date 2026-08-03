import { describe, expect, it, vi } from 'vitest';
import { useCartStore } from '../useCartStore';
import { INITIAL_PRODUCTS } from '../../data/mockProducts';

vi.mock('../useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({ isCustomerLoggedIn: false }),
  },
}));

describe('useCartStore guest behavior', () => {
  it('persists guest cart items locally', () => {
    useCartStore.getState().clearCart();
    useCartStore.getState().addItem({ product: INITIAL_PRODUCTS[0], quantity: 2 });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    expect(JSON.parse(localStorage.getItem('guru_diamonds_cart_items_v1') || '[]')).toHaveLength(1);
  });
});
