import { describe, expect, it } from 'vitest';
import { buildCheckoutInputFromCart, validateAddress } from '../checkout';

const baseAddress = {
  id: 'addr-test',
  fullName: 'Test Customer',
  phone: '+91 9876543210',
  email: 'test@example.com',
  street: 'MG Road',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411001',
  country: 'India',
  isDefault: true,
  addressType: 'Home' as const,
};

describe('checkout validation', () => {
  it('accepts a complete Indian shipping address', () => {
    expect(() => validateAddress(baseAddress)).not.toThrow();
  });

  it('rejects invalid pincodes', () => {
    expect(() => validateAddress({ ...baseAddress, pincode: '4110' })).toThrow('Valid 6 digit pincode');
  });

  it('uses submitted checkout items when the customer database cart is empty', async () => {
    const createdItems: any[] = [];
    const tx = {
      cart: {
        findUnique: async () => ({ id: 'cart-empty', customerId: 'cust-1', couponCode: null, items: [] }),
        upsert: async () => ({ id: 'cart-empty', customerId: 'cust-1', items: [] }),
      },
      cartItem: {
        deleteMany: async () => ({ count: 0 }),
        createMany: async ({ data }: any) => {
          createdItems.push(...data);
          return { count: data.length };
        },
      },
    };

    const result = await buildCheckoutInputFromCart(tx, 'cust-1', {
      shippingAddress: baseAddress,
      billingAddress: baseAddress,
      paymentMethod: 'UPI',
      items: [
        {
          productId: 'prod-1',
          variantId: undefined,
          selectedAttributes: {},
          quantity: 1,
        },
      ],
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].productId).toBe('prod-1');
    expect(createdItems).toHaveLength(1);
    expect(createdItems[0]).toMatchObject({ cartId: 'cart-empty', productId: 'prod-1', quantity: 1 });
  });
});

