import { AdminUser, Customer } from '../types';
import { apiRequest, jsonRequest } from './api';

export const authApi = {
  loginCustomer: (email: string, password: string) =>
    jsonRequest<{ token: string; customer: Customer }>('/auth/customer/login', 'POST', { email, password }),
  registerCustomer: (params: { name: string; email: string; phone: string; password: string }) =>
    jsonRequest<{ token: string; customer: Customer }>('/auth/customer/register', 'POST', params),
  loginAdmin: (email: string, password: string) =>
    jsonRequest<{ token: string; adminUser: AdminUser }>('/auth/admin/login', 'POST', { email, password }),
  me: () =>
    apiRequest<
      | { type: 'CUSTOMER'; customer: Customer }
      | { type: 'ADMIN'; adminUser: AdminUser }
    >('/auth/me'),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
};

