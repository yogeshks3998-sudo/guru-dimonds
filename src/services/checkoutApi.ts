import { Address, Order } from '../types';
import { jsonRequest } from './api';

export interface CheckoutPayload {
  shippingAddress: Address;
  billingAddress?: Address;
  items: {
    productId: string;
    variantId?: string;
    selectedAttributes?: Record<string, string>;
    quantity: number;
    customEngraving?: string;
  }[];
  couponCode?: string;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD';
  notes?: string;
  gstNumber?: string;
}

export const checkoutApi = {
  validate: (payload: CheckoutPayload) => jsonRequest('/checkout/validate', 'POST', payload),
  createOrder: (payload: CheckoutPayload) => jsonRequest<Order>('/checkout/create-order', 'POST', payload),
};

