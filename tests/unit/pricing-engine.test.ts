/**
 * @jest-environment node
 */
import { calculateJewelleryPrice } from '../../src/utils/pricing';
import { PricingService } from '../../backend/src/services/pricingService';
import { validateBulkPriceRequest } from '../../backend/src/utils/pricingValidation';
import { prisma } from '../../backend/src/config/db';

describe('Enterprise Pricing Engine Unit Tests', () => {
  describe('calculateJewelleryPrice', () => {
    it('calculates gold 22K rate-linked price accurately with Indian jewellery formula', () => {
      const breakdown = calculateJewelleryPrice({
        pricingMode: 'RATE_LINKED',
        metalType: 'GOLD',
        purity: '22K',
        netWeightGrams: 8.5,
        ratePerGram: 7000,
        makingChargeType: 'PER_GRAM',
        makingChargeValue: 600,
        wastagePercentage: 2.5,
        gemstones: [
          {
            type: 'Diamond',
            weightCaratOrGrams: 0.25,
            color: 'F',
            count: 1,
            totalPrice: 15000,
            certified: true,
          },
        ],
        certificationCharge: 750,
        packagingCharge: 250,
        gstPercentage: 3,
      });

      // 8.5 * 7000 * (22/24) = 54541.67 => 54542
      expect(breakdown.metalValue).toBe(54542);
      // 8.5 * 600 = 5100
      expect(breakdown.makingChargeTotal).toBe(5100);
      // (54542 * 2.5) / 100 = 1363.55 => 1364
      expect(breakdown.wastageValue).toBe(1364);
      // Gemstone = 15000
      expect(breakdown.gemstoneValue).toBe(15000);
      // Subtotal = 54542 + 5100 + 1364 + 15000 + 750 + 250 = 77006
      expect(breakdown.subtotal).toBe(77006);
      // GST (3%) = round(77006 * 0.03) = 2310
      expect(breakdown.gstAmount).toBe(2310);
      // Final Price = 77006 + 2310 = 79316
      expect(breakdown.finalPrice).toBe(79316);
    });

    it('calculates fixed price mode with discounts and GST', () => {
      const breakdown = calculateJewelleryPrice({
        pricingMode: 'FIXED',
        fixedPrice: 25000,
        metalType: 'SILVER',
        purity: '925',
        netWeightGrams: 12,
        ratePerGram: 85,
        makingChargeType: 'FIXED',
        makingChargeValue: 0,
        wastagePercentage: 0,
        discountAmount: 2000,
        gstPercentage: 3,
      });

      expect(breakdown.subtotal).toBe(25000);
      expect(breakdown.discount).toBe(2000);
      expect(breakdown.discountedSubtotal).toBe(23000);
      expect(breakdown.gstAmount).toBe(690); // 23000 * 3%
      expect(breakdown.finalPrice).toBe(23690);
    });
  });

  describe('Bulk Adjustment Validation', () => {
    it('accepts valid bulk adjustment payload', () => {
      const validated = validateBulkPriceRequest({
        category: 'Rings',
        adjustmentType: 'MAKING_CHARGE_PER_GRAM',
        adjustmentValue: 150,
        reason: 'Holiday Promotion',
      });

      expect(validated.category).toBe('Rings');
      expect(validated.adjustmentType).toBe('MAKING_CHARGE_PER_GRAM');
      expect(validated.adjustmentValue).toBe(150);
    });

    it('rejects invalid percentage adjustment exceeding 500%', () => {
      expect(() =>
        validateBulkPriceRequest({
          category: 'Rings',
          adjustmentType: 'MARGIN_PERCENTAGE',
          adjustmentValue: 600,
        })
      ).toThrow('Percentage adjustment must be between -100% and +500%');
    });

    it('rejects empty category', () => {
      expect(() =>
        validateBulkPriceRequest({
          category: '',
          adjustmentType: 'MAKING_CHARGE_PER_GRAM',
          adjustmentValue: 100,
        })
      ).toThrow('Category is required');
    });
  });

  describe('PricingService Simulation & Audit', () => {
    it('calculates preview impact accurately without modifying database', async () => {
      const preview = await PricingService.previewBulkAdjustment('Rings', 'MAKING_CHARGE_PER_GRAM', 100);
      expect(preview.category).toBe('Rings');
      expect(preview.adjustmentType).toBe('MAKING_CHARGE_PER_GRAM');
      expect(preview.adjustmentValue).toBe(100);
      expect(Array.isArray(preview.items)).toBe(true);

      if (preview.items.length > 0) {
        expect(preview.items[0].newPrice).toBeGreaterThanOrEqual(preview.items[0].oldPrice);
        expect(preview.items[0].priceDifference).toBeGreaterThanOrEqual(0);
        expect(preview.affectedProductsCount).toBe(preview.items.length);
      }
    });
  });
});
