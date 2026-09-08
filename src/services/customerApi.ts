import { Customer } from '../types';
import { apiRequest, jsonRequest } from './api';

export const customerApi = {
  listCustomers: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    const qs = query.toString();
    return apiRequest<Customer[]>(`/customers${qs ? `?${qs}` : ''}`);
  },
  getCustomer: (id: string) => apiRequest<Customer>(`/customers/${encodeURIComponent(id)}`),
  updateCustomerStatus: (id: string, status: string, tags?: string[]) =>
    jsonRequest<Customer>(`/customers/${encodeURIComponent(id)}/status`, 'PATCH', { status, tags }),
  updateCustomer: (id: string, customer: Customer) =>
    jsonRequest<Customer>(`/customers/${encodeURIComponent(id)}`, 'PUT', customer),
};
