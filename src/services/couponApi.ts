import { Coupon } from '../types';
import { apiRequest, jsonRequest } from './api';

export const couponApi = {
  listCoupons: () => apiRequest<Coupon[]>('/coupons'),
  validateCoupon: (code: string, subtotal: number) =>
    jsonRequest<{ success: boolean; message: string; coupon?: Coupon }>('/coupons/validate', 'POST', {
      code,
      subtotal,
    }),
};

