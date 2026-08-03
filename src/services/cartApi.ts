import { CartItem } from '../types';
import { apiRequest, jsonRequest } from './api';

export interface PersistedCart {
  id: string;
  customerId: string;
  couponCode?: string;
  items: CartItem[];
}

export const cartApi = {
  getCart: () => apiRequest<PersistedCart>('/cart'),
  addItem: (item: {
    productId: string;
    variantId?: string;
    selectedAttributes?: Record<string, string>;
    quantity: number;
    customEngraving?: string;
    giftWrap?: boolean;
    giftMessage?: string;
  }) => jsonRequest<PersistedCart>('/cart/items', 'POST', item),
  updateItem: (id: string, updates: { quantity?: number; giftWrap?: boolean; giftMessage?: string }) =>
    jsonRequest<PersistedCart>(`/cart/items/${encodeURIComponent(id)}`, 'PATCH', updates),
  removeItem: (id: string) => apiRequest<PersistedCart>(`/cart/items/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  clearCart: () => apiRequest<void>('/cart', { method: 'DELETE' }),
};

