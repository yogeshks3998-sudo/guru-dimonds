import { OrderStatus } from '../types';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'RETURN_REQUESTED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURNED', 'REFUNDED'],
  RETURNED: ['REFUNDED'],
  REFUNDED: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return transitions[from]?.includes(to) || false;
}

