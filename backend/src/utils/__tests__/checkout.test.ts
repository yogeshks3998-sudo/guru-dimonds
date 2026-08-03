import { describe, expect, it } from 'vitest';
import { validateAddress } from '../checkout';

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
});

