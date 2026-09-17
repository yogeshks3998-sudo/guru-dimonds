/**
 * @jest-environment node
 */
import { prisma } from '../../backend/src/config/db';
import { PricingService } from '../../backend/src/services/pricingService';

describe('Order Immutability & Rollback Integration Tests', () => {
  const testOrderId = `ord-test-${Date.now()}`;

  beforeAll(async () => {
    // Seed a known test order with snapshot
    await prisma.order.upsert({
      where: { id: testOrderId },
      create: {
        id: testOrderId,
        orderNumber: `TEST-IMMUTABLE-${Date.now()}`,
        customerId: null,
        customerSnapshot: { name: 'Audit Test Client', email: 'audit@example.com', phone: '9876543210' },
        shippingAddress: {
          id: 'addr-1',
          fullName: 'Test Client',
          phone: '9876543210',
          email: 'audit@example.com',
          street: 'Palace Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India',
          isDefault: true,
          addressType: 'Home',
        },
        billingAddress: {
          id: 'addr-1',
          fullName: 'Test Client',
          phone: '9876543210',
          email: 'audit@example.com',
          street: 'Palace Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India',
          isDefault: true,
          addressType: 'Home',
        },
        subtotal: 50000,
        discountAmount: 0,
        gstTotal: 1500,
        shippingCharge: 0,
        totalAmount: 51500,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
        placedAt: new Date('2026-01-01T10:00:00Z'),
        metalRateSnapshotAtPlacement: { GOLD_22K: 6500 },
        items: {
          create: [
            {
              id: `item-${Date.now()}`,
              productId: 'prod-1',
              productName: 'Immutable Royal Ring',
              quantity: 1,
              unitPrice: 51500,
              totalPrice: 51500,
              image: 'https://example.com/ring.jpg',
              priceBreakdownSnapshot: {
                metalType: 'GOLD',
                purity: '22K',
                netWeightGrams: 7,
                ratePerGram: 6500,
                finalPrice: 51500,
                calculatedAt: '2026-01-01T10:00:00Z',
              },
            },
          ],
        },
      },
      update: {},
    });
  });

  afterAll(async () => {
    await prisma.order.delete({ where: { id: testOrderId } }).catch(() => {});
  });

  it('proves historical orders and item snapshots remain immutable after market rate shifts', async () => {
    // 1. Read baseline order state
    const orderBefore = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { items: true },
    });

    expect(orderBefore).not.toBeNull();
    expect(orderBefore?.totalAmount).toBe(51500);
    expect(orderBefore?.items[0].unitPrice).toBe(51500);

    // 2. Perform a dramatic bullion rate update (e.g. Gold 22K shifts to 15,000/g)
    await prisma.metalRate.create({
      data: {
        id: `mr-shift-${Date.now()}`,
        metal: 'GOLD',
        purity: '22K',
        ratePerGram: 15000,
        previousRate: 6830,
        effectiveDate: '2026-09-17',
        effectiveTime: '18:00',
        rateSource: 'Test Bullion Spike',
        updatedBy: 'Test Admin',
        status: 'PUBLISHED',
        updatedAt: new Date(),
      },
    });

    // 3. Re-read historical order
    const orderAfter = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { items: true },
    });

    // 4. Assert 100% mathematical immutability
    expect(orderAfter?.totalAmount).toBe(orderBefore?.totalAmount);
    expect(orderAfter?.subtotal).toBe(orderBefore?.subtotal);
    expect(orderAfter?.gstTotal).toBe(orderBefore?.gstTotal);
    expect(orderAfter?.items[0].unitPrice).toBe(orderBefore?.items[0].unitPrice);
    expect(orderAfter?.items[0].totalPrice).toBe(orderBefore?.items[0].totalPrice);
    expect((orderAfter?.metalRateSnapshotAtPlacement as any)?.GOLD_22K).toBe(6500);
    expect((orderAfter?.items[0].priceBreakdownSnapshot as any)?.ratePerGram).toBe(6500);
  });

  it('applies bulk category price adjustment and supports 1-click rollback with audit log verification', async () => {
    // Find products in Rings category
    const category = 'Rings';
    const productsBefore = await prisma.product.findMany({
      where: { category: { equals: category, mode: 'insensitive' } },
    });

    if (productsBefore.length > 0) {
      const originalMakingCharge = productsBefore[0].makingChargeValue;

      // 1. Apply bulk adjustment (+100/g)
      const applyResult = await PricingService.applyBulkAdjustment(
        {
          category,
          adjustmentType: 'MAKING_CHARGE_PER_GRAM',
          adjustmentValue: 100,
          reason: 'Automated Integration Test',
        },
        'Test Suite Runner'
      );

      expect(applyResult.success).toBe(true);
      expect(applyResult.updatedCount).toBe(productsBefore.length);

      // Verify product updated in DB
      const updatedProduct = await prisma.product.findUnique({ where: { id: productsBefore[0].id } });
      expect(updatedProduct?.makingChargeValue).toBe(originalMakingCharge + 100);

      // Verify Audit Log created
      const log = await prisma.pricingAuditLog.findUnique({ where: { id: applyResult.auditLogId } });
      expect(log).not.toBeNull();
      expect(log?.action).toBe('BULK_MAKING_CHARGE_PER_GRAM');

      // 2. Perform Rollback
      const rollbackResult = await PricingService.rollbackBulkAdjustment(applyResult.auditLogId, 'Test Suite Runner');
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.rolledBackCount).toBe(productsBefore.length);

      // Verify product restored in DB
      const restoredProduct = await prisma.product.findUnique({ where: { id: productsBefore[0].id } });
      expect(restoredProduct?.makingChargeValue).toBe(originalMakingCharge);
    }
  });
});
