import { AdminUser, Customer } from '../types';
import { apiRequest, jsonRequest } from './api';

export type RegisterCustomerResponse =
  | { success: true; token: string; customer: Customer; message?: string }
  | { token: string; customer: Customer };

export const authApi = {
  loginCustomer: (identifier: string, password: string) =>
    jsonRequest<{ token: string; customer: Customer }>('/auth/customer/login', 'POST', { identifier, email: identifier, password }),
  registerCustomer: (params: { name: string; phone: string; email?: string; password: string; confirmPassword?: string }) =>
    jsonRequest<{ success: true; token: string; customer: Customer; message?: string }>('/auth/customer/register', 'POST', params),
  verifyCustomerOtp: (params: { email?: string; phone?: string; otp: string } | string, otp?: string) => {
    const payload = typeof params === 'string' ? { phone: params, otp: otp || '' } : params;
    return jsonRequest<{ token: string; customer: Customer }>('/auth/customer/verify-otp', 'POST', payload);
  },
  resendCustomerOtp: (params: { email?: string; phone?: string } | string) => {
    const payload = typeof params === 'string' ? { phone: params } : params;
    return jsonRequest<{ success: true; message: string }>('/auth/customer/resend-otp', 'POST', payload);
  },
  loginAdmin: (email: string, password: string) =>
    jsonRequest<{ token: string; adminUser: AdminUser }>('/auth/admin/login', 'POST', { email, password }),
  me: () =>
    apiRequest<
      | { type: 'CUSTOMER'; customer: Customer }
      | { type: 'ADMIN'; adminUser: AdminUser }
    >('/auth/me'),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
};
