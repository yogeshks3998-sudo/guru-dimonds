import { apiRequest, jsonRequest } from './api';

export const wishlistApi = {
  getWishlist: () => apiRequest<{ productIds: string[] }>('/wishlist'),
  addItem: (productId: string) => jsonRequest<{ productIds: string[] }>('/wishlist/items', 'POST', { productId }),
  removeItem: (productId: string) =>
    apiRequest<{ productIds: string[] }>(`/wishlist/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }),
  clearWishlist: () => apiRequest<void>('/wishlist', { method: 'DELETE' }),
};

