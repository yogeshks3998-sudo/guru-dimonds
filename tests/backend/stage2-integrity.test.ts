/**
 * @jest-environment node
 */
import { api } from '../helpers/api';
import { authHeader, tokenFor } from '../helpers/auth';
import { productFactory, customerFactory, orderFactory, uniqueId } from '../helpers/factories';
import { prisma } from '../../backend/src/config/db';
import { cleanupOrder } from '../helpers/db';
import { toCustomerData } from '../../backend/src/utils/serializers';

describe('Stage 2: Order, Variant & Database Integrity', () => {
  const ownerAuth = authHeader(tokenFor({ role: 'OWNER' }));
  const customerA = customerFactory();
  const customerB = customerFactory();
  const customerAToken = authHeader(tokenFor({ type: 'CUSTOMER', sub: customerA.id, email: customerA.email }));
  const customerBToken = authHeader(tokenFor({ type: 'CUSTOMER', sub: customerB.id, email: customerB.email }));

  let testProduct: any;
  let testVariant1Id: string;
  let testVariant2Id: string;
  let testOrderId: string;

  beforeAll(async () => {
    // Seed customerA and customerB
    await prisma.customer.upsert({
      where: { id: customerA.id },
      create: toCustomerData(customerA) as any,
      update: {},
    });

    await prisma.customer.upsert({
      where: { id: customerB.id },
      create: toCustomerData(customerB) as any,
      update: {},
    });

    // Create a product with 2 variants
    testVariant1Id = uniqueId('v1');
    testVariant2Id = uniqueId('v2');
    const prod = productFactory({
      name: 'Stage2 Test Diamond Ring',
      sku: uniqueId('SKU-PROD'),
      hasVariants: true,
      totalStock: 50,
      variants: [
        {
          id: testVariant1Id,
          sku: uniqueId('SKU-V1'),
          barcode: 'BAR-V1',
          attributes: { size: '14' },
          price: 5000,
          compareAtPrice: 6000,
          netWeightGrams: 4.5,
          grossWeightGrams: 5.0,
          stock: 25,
          images: [],
          enabled: true,
          dispatchTimeDays: 3,
        },
        {
          id: testVariant2Id,
          sku: uniqueId('SKU-V2'),
          barcode: 'BAR-V2',
          attributes: { size: '16' },
          price: 5200,
          compareAtPrice: 6200,
          netWeightGrams: 4.7,
          grossWeightGrams: 5.2,
          stock: 25,
          images: [],
          enabled: true,
          dispatchTimeDays: 3,
        },
      ],
    });

    const res = await api().post('/api/products').set(ownerAuth).send(prod).expect(201);
    testProduct = res.body;

    // Set reserved inventory to test non-destructive inventory updates
    await prisma.inventoryItem.updateMany({
      where: { productId: testProduct.id },
      data: { reserved: 5 },
    });
  });

  afterAll(async () => {
    if (testOrderId) {
      await cleanupOrder(testOrderId);
    }
    if (testProduct?.id) {
      // Clean up cart items and orders referencing testProduct
      await prisma.cartItem.deleteMany({ where: { productId: testProduct.id } });
      await prisma.orderItem.deleteMany({ where: { productId: testProduct.id } });
      await prisma.productVariant.deleteMany({ where: { productId: testProduct.id } });
      await prisma.inventoryItem.deleteMany({ where: { productId: testProduct.id } });
      await prisma.productMedia.deleteMany({ where: { productId: testProduct.id } });
      await prisma.product.deleteMany({ where: { id: testProduct.id } });
    }
    await prisma.customer.deleteMany({ where: { id: { in: [customerA.id, customerB.id] } } });
    await prisma.$disconnect();
  });

  describe('Product Variant Synchronization & Integrity', () => {
    it('updates product and maintains stable variant IDs', async () => {
      const updatePayload = {
        ...testProduct,
        name: 'Stage2 Test Diamond Ring (Updated)',
        variants: [
          {
            ...testProduct.variants[0],
            price: 5500,
          },
          {
            ...testProduct.variants[1],
            price: 5700,
          },
        ],
      };

      const res = await api()
        .put(`/api/products/${testProduct.id}`)
        .set(ownerAuth)
        .send(updatePayload)
        .expect(200);

      expect(res.body.name).toBe('Stage2 Test Diamond Ring (Updated)');
      expect(res.body.variants.length).toBe(2);
      // Stable IDs verified
      expect(res.body.variants[0].id).toBe(testVariant1Id);
      expect(res.body.variants[0].price).toBe(5500);
      expect(res.body.variants[1].id).toBe(testVariant2Id);
      expect(res.body.variants[1].price).toBe(5700);

      // Verify reserved inventory was preserved
      const inv = await prisma.inventoryItem.findFirst({ where: { productId: testProduct.id } });
      expect(inv?.reserved).toBe(5);
    });

    it('safely updates product when an active CartItem references a variant', async () => {
      // Create a customer cart referencing testVariant1Id
      const cart = await prisma.cart.upsert({
        where: { customerId: customerA.id },
        create: { customerId: customerA.id },
        update: {},
      });

      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: testProduct.id,
          variantId: testVariant1Id,
          selectedAttributes: { size: '14' },
          quantity: 1,
        },
      });

      // Update product removing variant 1 from incoming payload
      // System must NOT crash; it should retire/disable variant 1 instead of deleting
      const updatePayload = {
        ...testProduct,
        variants: [testProduct.variants[1]], // only variant 2 passed
      };

      const res = await api()
        .put(`/api/products/${testProduct.id}`)
        .set(ownerAuth)
        .send(updatePayload)
        .expect(200);

      expect(res.status).toBe(200);

      // Variant 1 should still exist in DB (retired with enabled: false) because CartItem references it
      const retiredVar = await prisma.productVariant.findUnique({ where: { id: testVariant1Id } });
      expect(retiredVar).not.toBeNull();
      expect(retiredVar?.enabled).toBe(false);

      // Cart item must remain intact
      const preservedCartItem = await prisma.cartItem.findUnique({ where: { id: cartItem.id } });
      expect(preservedCartItem?.variantId).toBe(testVariant1Id);

      // Clean up cart item
      await prisma.cartItem.delete({ where: { id: cartItem.id } });
    });

    it('safely updates product when an historical OrderItem references a variant', async () => {
      // Create an order referencing testVariant2Id
      const order = orderFactory({
        customer: { id: customerA.id, name: customerA.name, email: customerA.email, phone: customerA.phone },
        items: [
          {
            id: uniqueId('oi'),
            orderId: '',
            productId: testProduct.id,
            variantId: testVariant2Id,
            productName: testProduct.name,
            variantSku: testProduct.variants[1].sku,
            image: '/image.png',
            quantity: 1,
            unitPrice: 5700,
            totalPrice: 5700,
            priceBreakdownSnapshot: {},
          },
        ],
      });

      const orderRes = await api().post('/api/orders').send(order).expect(201);
      testOrderId = orderRes.body.id;

      // Update product with both variants
      const updatePayload = {
        ...testProduct,
        variants: [
          { ...testProduct.variants[0], enabled: true },
          { ...testProduct.variants[1], price: 5800 },
        ],
      };

      const res = await api()
        .put(`/api/products/${testProduct.id}`)
        .set(ownerAuth)
        .send(updatePayload)
        .expect(200);

      expect(res.status).toBe(200);

      // Historical order item must remain unchanged
      const historicalItem = await prisma.orderItem.findFirst({ where: { orderId: testOrderId } });
      expect(historicalItem?.variantId).toBe(testVariant2Id);
      expect(historicalItem?.unitPrice).toBe(5700); // Historical price untouched
    });

    it('adds a new variant without modifying existing variants', async () => {
      const newVariantSku = uniqueId('SKU-V3');
      const updatePayload = {
        ...testProduct,
        variants: [
          testProduct.variants[0],
          testProduct.variants[1],
          {
            sku: newVariantSku,
            barcode: 'BAR-V3',
            attributes: { size: '18' },
            price: 5400,
            netWeightGrams: 5.0,
            grossWeightGrams: 5.5,
            stock: 20,
            images: [],
            enabled: true,
            dispatchTimeDays: 3,
          },
        ],
      };

      const res = await api()
        .put(`/api/products/${testProduct.id}`)
        .set(ownerAuth)
        .send(updatePayload)
        .expect(200);

      expect(res.body.variants.length).toBe(3);
      const added = res.body.variants.find((v: any) => v.sku.toUpperCase() === newVariantSku.toUpperCase());
      expect(added).toBeDefined();
      expect(added.stock).toBe(20);
    });

    it('rejects duplicate SKUs within incoming variants payload with 400', async () => {
      const duplicateSku = 'DUPLICATE-SKU-TEST';
      const updatePayload = {
        ...testProduct,
        variants: [
          { ...testProduct.variants[0], sku: duplicateSku },
          { ...testProduct.variants[1], sku: duplicateSku },
        ],
      };

      const res = await api()
        .put(`/api/products/${testProduct.id}`)
        .set(ownerAuth)
        .send(updatePayload)
        .expect(400);

      expect(res.body.message).toMatch(/duplicate sku/i);
    });

    it('rejects attempt to modify a variant belonging to another product with 403', async () => {
      // Create a second product
      const otherProd = await api()
        .post('/api/products')
        .set(ownerAuth)
        .send(
          productFactory({
            sku: uniqueId('SKU-OTHER'),
            variants: [
              {
                id: uniqueId('other-v'),
                sku: uniqueId('SKU-OV'),
                barcode: 'BAR-OV',
                attributes: {},
                price: 1000,
                stock: 10,
                images: [],
                enabled: true,
                dispatchTimeDays: 3,
              },
            ],
          })
        )
        .expect(201);

      const otherVariantId = otherProd.body.variants[0].id;

      // Attempt to steal otherVariantId onto testProduct
      const maliciousPayload = {
        ...testProduct,
        variants: [{ id: otherVariantId, sku: uniqueId('STEAL'), price: 9999 }],
      };

      const res = await api()
        .put(`/api/products/${testProduct.id}`)
        .set(ownerAuth)
        .send(maliciousPayload)
        .expect(403);

      expect(res.body.message).toMatch(/different product/i);

      // Clean up second product
      await prisma.productVariant.deleteMany({ where: { productId: otherProd.body.id } });
      await prisma.productMedia.deleteMany({ where: { productId: otherProd.body.id } });
      await prisma.inventoryItem.deleteMany({ where: { productId: otherProd.body.id } });
      await prisma.product.delete({ where: { id: otherProd.body.id } });
    });
  });

  describe('Customer Order History (GET /api/orders/my-orders)', () => {
    it('returns orders for authenticated customer A', async () => {
      const res = await api()
        .get('/api/orders/my-orders')
        .set(customerAToken)
        .expect(200);

      expect(res.body.orders).toBeDefined();
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThanOrEqual(1);
      expect(res.body.orders[0].customer.id).toBe(customerA.id);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('returns empty order history for authenticated customer B with no orders', async () => {
      const res = await api()
        .get('/api/orders/my-orders')
        .set(customerBToken)
        .expect(200);

      expect(res.body.orders).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('rejects unauthenticated request with 401', async () => {
      await api().get('/api/orders/my-orders').expect(401);
    });

    it('rejects malformed token with 401', async () => {
      await api().get('/api/orders/my-orders').set(authHeader('malformed-token')).expect(401);
    });

    it('prevents customer B from accessing customer A order by ID (403 IDOR prevention)', async () => {
      await api()
        .get(`/api/orders/${testOrderId}`)
        .set(customerBToken)
        .expect(403);
    });

    it('allows customer A to access their own order by ID', async () => {
      const res = await api()
        .get(`/api/orders/${testOrderId}`)
        .set(customerAToken)
        .expect(200);

      expect(res.body.id).toBe(testOrderId);
      expect(res.body.customer.id).toBe(customerA.id);
    });

    it('supports pagination on /api/orders/my-orders', async () => {
      const res = await api()
        .get('/api/orders/my-orders?page=1&limit=1')
        .set(customerAToken)
        .expect(200);

      expect(res.body.orders.length).toBeLessThanOrEqual(1);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(1);
    });
  });

  describe('Inventory Release on Order Cancellation', () => {
    it('restores product and variant inventory when an order is cancelled', async () => {
      // 1. Get initial variant stock
      const initialVar = await prisma.productVariant.findUnique({ where: { id: testVariant2Id } });
      const initialProd = await prisma.product.findUnique({ where: { id: testProduct.id } });
      const varStockBefore = initialVar!.stock;
      const prodStockBefore = initialProd!.totalStock;

      // 2. Mark order status CANCELLED
      await api()
        .patch(`/api/orders/${testOrderId}/status`)
        .set(ownerAuth)
        .send({ status: 'CANCELLED', note: 'Customer cancelled' })
        .expect(200);

      // 3. Verify stock was incremented by 1
      const updatedVar = await prisma.productVariant.findUnique({ where: { id: testVariant2Id } });
      const updatedProd = await prisma.product.findUnique({ where: { id: testProduct.id } });

      expect(updatedVar!.stock).toBe(varStockBefore + 1);
      expect(updatedProd!.totalStock).toBe(prodStockBefore + 1);
    });
  });
});
