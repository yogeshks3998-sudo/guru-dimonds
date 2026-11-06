import { Order } from '../types';
import { apiRequest, jsonRequest } from './api';

export const orderApi = {
  listOrders: () => apiRequest<Order[]>('/orders'),
  listMyOrders: async (page = 1, limit = 20): Promise<Order[]> => {
    const res = await apiRequest<{ orders: Order[]; pagination: any } | Order[]>(
      `/orders/my-orders?page=${page}&limit=${limit}`
    );
    if (Array.isArray(res)) return res;
    return res && Array.isArray((res as any).orders) ? (res as any).orders : [];
  },
  getOrder: (idOrNumber: string) => apiRequest<Order>(`/orders/${encodeURIComponent(idOrNumber)}`),
  createOrder: (order: Order) => jsonRequest<Order>('/orders', 'POST', order),
  updateStatus: (id: string, status: string, note?: string, updatedBy?: string) =>
    jsonRequest<Order>(`/orders/${encodeURIComponent(id)}/status`, 'PATCH', { status, note, updatedBy }),
};

