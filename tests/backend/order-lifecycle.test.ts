/**
 * @jest-environment node
 */
import { canTransitionOrderStatus } from '../../src/utils/orderLifecycle';

describe('Backend order lifecycle rules', () => {
  it('allows valid order progression', () => {
    expect(canTransitionOrderStatus('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(canTransitionOrderStatus('PROCESSING', 'QUALITY_CHECK')).toBe(true);
    expect(canTransitionOrderStatus('SHIPPED', 'OUT_FOR_DELIVERY')).toBe(true);
    expect(canTransitionOrderStatus('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
  });

  it('rejects invalid order jumps', () => {
    expect(canTransitionOrderStatus('CONFIRMED', 'DELIVERED')).toBe(false);
    expect(canTransitionOrderStatus('CANCELLED', 'PROCESSING')).toBe(false);
  });
});
