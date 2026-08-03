import { describe, expect, it } from 'vitest';
import { calculateJewelleryPrice } from '../pricing';

describe('calculateJewelleryPrice', () => {
  it('calculates rate-linked jewellery price with GST', () => {
    const price = calculateJewelleryPrice({
      pricingMode: 'RATE_LINKED',
      metalType: 'GOLD',
      purity: '22K',
      netWeightGrams: 10,
      ratePerGram: 6000,
      makingChargeType: 'PER_GRAM',
      makingChargeValue: 500,
      wastagePercentage: 2,
      gemstones: [{ type: 'Ruby', weightCaratOrGrams: 1, color: 'Red', count: 1, totalPrice: 10000, certified: true }],
      certificationCharge: 500,
      packagingCharge: 250,
      gstPercentage: 3,
    });

    expect(price.metalValue).toBe(55000);
    expect(price.makingChargeTotal).toBe(5000);
    expect(price.wastageValue).toBe(1100);
    expect(price.subtotal).toBe(71850);
    expect(price.gstAmount).toBe(2156);
    expect(price.finalPrice).toBe(74006);
  });

  it('uses fixed price mode when configured', () => {
    const price = calculateJewelleryPrice({
      pricingMode: 'FIXED',
      fixedPrice: 10000,
      metalType: 'SILVER',
      purity: '925',
      netWeightGrams: 5,
      ratePerGram: 80,
      makingChargeType: 'FIXED',
      makingChargeValue: 0,
      wastagePercentage: 0,
      discountAmount: 1000,
      gstPercentage: 3,
    });

    expect(price.subtotal).toBe(10000);
    expect(price.discountedSubtotal).toBe(9000);
    expect(price.finalPrice).toBe(9270);
  });
});

