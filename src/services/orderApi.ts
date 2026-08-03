import { Order } from '../types';
import { apiRequest, jsonRequest } from './api';

export const orderApi = {
  listOrders: () => apiRequest<Order[]>('/orders'),
  getOrder: (idOrNumber: string) => apiRequest<Order>(`/orders/${encodeURIComponent(idOrNumber)}`),
  createOrder: (order: Order) => jsonRequest<Order>('/orders', 'POST', order),
  updateStatus: (id: string, status: string, note?: string, updatedBy?: string) =>
    jsonRequest<Order>(`/orders/${encodeURIComponent(id)}/status`, 'PATCH', { status, note, updatedBy }),
};

