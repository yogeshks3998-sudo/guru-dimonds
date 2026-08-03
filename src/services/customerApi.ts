import { Customer } from '../types';
import { apiRequest, jsonRequest } from './api';

export const customerApi = {
  listCustomers: () => apiRequest<Customer[]>('/customers'),
  getCustomer: (id: string) => apiRequest<Customer>(`/customers/${encodeURIComponent(id)}`),
  updateCustomer: (id: string, customer: Customer) =>
    jsonRequest<Customer>(`/customers/${encodeURIComponent(id)}`, 'PUT', customer),
};

