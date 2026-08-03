import { describe, expect, it } from 'vitest';
import { canTransitionOrderStatus } from '../orderLifecycle';

describe('order lifecycle transitions', () => {
  it('allows expected fulfillment progression', () => {
    expect(canTransitionOrderStatus('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(canTransitionOrderStatus('PACKED', 'SHIPPED')).toBe(true);
    expect(canTransitionOrderStatus('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
  });

  it('blocks invalid status jumps', () => {
    expect(canTransitionOrderStatus('CONFIRMED', 'DELIVERED')).toBe(false);
    expect(canTransitionOrderStatus('CANCELLED', 'PROCESSING')).toBe(false);
  });
});

