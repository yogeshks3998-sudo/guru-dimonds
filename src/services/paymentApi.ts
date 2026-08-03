import { jsonRequest } from './api';

export const paymentApi = {
  createRazorpayOrder: (amount: number, method?: string) =>
    jsonRequest('/payments/razorpay/create-order', 'POST', { amount, method }),
  verifyRazorpayPayment: (payload: unknown) => jsonRequest('/payments/razorpay/verify', 'POST', payload),
};

