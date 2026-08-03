import { create } from 'zustand';
import { Order, OrderStatus, Address } from '../types';
import { INITIAL_ORDERS } from '../data/mockData';
import { orderApi } from '../services/orderApi';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  // Actions
  placeOrder: (params: {
    customer: { id: string; name: string; email: string; phone: string };
    shippingAddress: Address;
    billingAddress: Address;
    items: any[];
    subtotal: number;
    discountAmount: number;
    couponCode?: string;
    gstTotal: number;
    shippingCharge: number;
    totalAmount: number;
    paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD';
    notes?: string;
  }) => Order;
  
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, updatedBy?: string) => void;
  addTrackingInfo: (orderId: string, trackingNumber: string, courierPartner: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  hydrateOrders: () => Promise<void>;
}

const LOCAL_KEY = 'guru_diamonds_orders_v1';
const LEGACY_LOCAL_KEY = 'vedaara_orders_v1';

const getInitialOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(LOCAL_KEY) || localStorage.getItem(LEGACY_LOCAL_KEY);
    if (data && !localStorage.getItem(LOCAL_KEY)) {
      localStorage.setItem(LOCAL_KEY, data);
    }
    return data ? JSON.parse(data) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
};

const saveOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
  } catch {}
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: getInitialOrders(),
  loading: false,
  error: null,

  hydrateOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await orderApi.listOrders();
      saveOrders(orders);
      set({ orders, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Unable to load orders from API' });
    }
  },

  placeOrder: (params) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GD-2026-${randomNum}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: params.customer,
      shippingAddress: params.shippingAddress,
      billingAddress: params.billingAddress,
      items: params.items,
      subtotal: params.subtotal,
      discountAmount: params.discountAmount,
      couponCode: params.couponCode,
      gstTotal: params.gstTotal,
      shippingCharge: params.shippingCharge,
      totalAmount: params.totalAmount,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'CONFIRMED',
      placedAt: now,
      metalRateSnapshotAtPlacement: {
        GOLD_24K: 7450,
        SILVER_925: 82,
      },
      notes: params.notes,
      history: [
        {
          status: 'CONFIRMED',
          timestamp: now,
          note: `Order placed via ${params.paymentMethod}.`,
          updatedBy: params.customer.name,
        },
      ],
      gstInvoiceNumber: `INV-2026-07-${randomNum}`,
    };

    const updated = [newOrder, ...get().orders];
    saveOrders(updated);
    set({ orders: updated });
    void orderApi.createOrder(newOrder).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to persist order' });
    });
    return newOrder;
  },

  updateOrderStatus: (orderId, status, note = '', updatedBy = 'Admin User') => {
    const updated = get().orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: status,
          history: [
            ...o.history,
            {
              status,
              timestamp: new Date().toISOString(),
              note: note || `Status updated to ${status}`,
              updatedBy,
            },
          ],
        };
      }
      return o;
    });
    saveOrders(updated);
    set({ orders: updated });
    void orderApi.updateStatus(orderId, status, note, updatedBy).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to persist order status' });
    });
  },

  addTrackingInfo: (orderId, trackingNumber, courierPartner) => {
    const updated = get().orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          trackingNumber,
          courierPartner,
          orderStatus: 'SHIPPED' as OrderStatus,
          history: [
            ...o.history,
            {
              status: 'SHIPPED' as OrderStatus,
              timestamp: new Date().toISOString(),
              note: `Dispatched via ${courierPartner}. Tracking ID: ${trackingNumber}`,
              updatedBy: 'Logistics Manager',
            },
          ],
        };
      }
      return o;
    });
    saveOrders(updated);
    set({ orders: updated });
  },

  cancelOrder: (orderId, reason) => {
    get().updateOrderStatus(orderId, 'CANCELLED', `Order cancelled. Reason: ${reason}`, 'Customer / Admin');
  },

  requestReturn: (orderId, reason) => {
    get().updateOrderStatus(orderId, 'RETURN_REQUESTED', `Return requested. Reason: ${reason}`, 'Customer');
  },
}));
