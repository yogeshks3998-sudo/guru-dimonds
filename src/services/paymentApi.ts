import { jsonRequest } from './api';
import type { CheckoutPayload } from './checkoutApi';
import type { Order } from '../types';

export interface RazorpayOrderResponse {
  keyId: string;
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  displayAmount: number;
  currency: 'INR';
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  description: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  order: Order;
}

export const paymentApi = {
  createRazorpayOrder: (payload: CheckoutPayload) =>
    jsonRequest<RazorpayOrderResponse>('/payments/razorpay/create-order', 'POST', payload),
  verifyRazorpayPayment: (payload: unknown) =>
    jsonRequest<RazorpayVerifyResponse>('/payments/razorpay/verify', 'POST', payload),
};

