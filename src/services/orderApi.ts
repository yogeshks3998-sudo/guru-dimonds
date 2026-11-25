import { Order } from '../types';
import { apiRequest, jsonRequest } from './api';

export interface PublicOrderTracking {
  orderNumber: string;
  orderStatus: string;
  courierPartner: string;
  trackingNumber: string;
  placedAt: string;
  history: Array<{ status: string; note: string; timestamp: string }>;
  items: Array<{ productName: string; quantity: number; image: string }>;
}

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
  trackOrder: (reference: string, contact?: string) => {
    const query = contact ? `?contact=${encodeURIComponent(contact)}` : '';
    return apiRequest<PublicOrderTracking>(`/orders/track/${encodeURIComponent(reference)}${query}`);
  },
  createOrder: (order: Order) => jsonRequest<Order>('/orders', 'POST', order),
  updateStatus: (id: string, status: string, note?: string, updatedBy?: string) =>
    jsonRequest<Order>(`/orders/${encodeURIComponent(id)}/status`, 'PATCH', { status, note, updatedBy }),
};

