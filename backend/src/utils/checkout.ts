import type { Address, Order, OrderItem } from '../../../src/types';
import { calculateJewelleryPrice } from '../../../src/utils/pricing';
import { HttpError } from './http';
import { toProductResponse } from './serializers';

type CheckoutItemInput = {
  productId: string;
  variantId?: string;
  selectedAttributes?: Record<string, string>;
  quantity: number;
  customEngraving?: string;
};

export type CheckoutInput = {
  shippingAddress: Address;
  billingAddress?: Address;
  items: CheckoutItemInput[];
  couponCode?: string;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD';
  notes?: string;
  gstNumber?: string;
};

export const buildCheckoutInputFromCart = async (
  tx: any,
  customerId: string,
  input: CheckoutInput
): Promise<CheckoutInput> => {
  const requestItems = (input.items || [])
    .map((item) => ({
      productId: String(item.productId || ''),
      variantId: item.variantId ? String(item.variantId) : undefined,
      selectedAttributes: item.selectedAttributes || {},
      quantity: Math.max(1, Number(item.quantity || 1)),
      customEngraving: item.customEngraving,
    }))
    .filter((item) => item.productId);
  const cart = await tx.cart.findUnique({
    where: { customerId },
    include: { items: { orderBy: { addedAt: 'asc' as const } } },
  });
  let cartItems = cart?.items.length
    ? cart.items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        selectedAttributes: item.selectedAttributes || {},
        quantity: item.quantity,
        customEngraving: item.customEngraving || undefined,
      }))
    : requestItems;

  if (!cartItems.length) throw new HttpError(400, 'Cart is empty');

  if (!cart?.items.length && requestItems.length) {
    const syncedCart = await tx.cart.upsert({
      where: { customerId },
      create: { customerId },
      update: {},
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: syncedCart.id } });
    await tx.cartItem.createMany({
      data: requestItems.map((item) => ({
        cartId: syncedCart.id,
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        selectedAttributes: item.selectedAttributes || {},
        customEngraving: item.customEngraving || null,
        giftWrap: false,
        giftMessage: null,
      })),
    });

    cartItems = requestItems;
  }

  return {
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress || input.shippingAddress,
    couponCode: cart?.couponCode || input.couponCode,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    gstNumber: input.gstNumber,
    items: cartItems,
  };
};

const validPincode = (value: string) => /^\d{6}$/.test(value);
const validPhone = (value: string) => value.replace(/\D/g, '').length >= 10;

export const validateAddress = (address: Address) => {
  if (!address.fullName || !address.phone || !address.email || !address.street || !address.city || !address.state) {
    throw new HttpError(400, 'Complete shipping address is required');
  }
  if (!validPhone(address.phone)) throw new HttpError(400, 'Valid phone number is required');
  if (!validPincode(address.pincode)) throw new HttpError(400, 'Valid 6 digit pincode is required');
};

export const calculateCheckout = async (tx: any, input: CheckoutInput) => {
  if (!input.items.length) throw new HttpError(400, 'Cart is empty');
  validateAddress(input.shippingAddress);
  validateAddress(input.billingAddress || input.shippingAddress);

  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  let gstTotal = 0;
  const metalRateSnapshotAtPlacement: Record<string, number> = {};
  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const productRecords = await tx.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const productsById = new Map<string, any>(
    productRecords.map((product: any) => [product.id, toProductResponse(product)])
  );

  const rateKeys = [
    ...new Set(productRecords.map((product: any) => `${product.metalType}_${product.metalPurity}`)),
  ] as string[];
  const rateFilters = rateKeys.map((key: string) => {
    const [metal, purity] = key.split('_');
    return { metal, purity, status: 'PUBLISHED' };
  });
  const publishedRates = rateFilters.length
    ? await tx.metalRate.findMany({
        where: { OR: rateFilters },
        orderBy: { updatedAt: 'desc' },
      })
    : [];
  const ratesByKey = new Map<string, number>();
  for (const rate of publishedRates) {
    const key = `${rate.metal}_${rate.purity}`;
    if (!ratesByKey.has(key)) ratesByKey.set(key, rate.ratePerGram);
  }
  const defaultRates: Record<string, number> = {
    GOLD_24K: 7450,
    GOLD_22K: 6830,
    GOLD_18K: 5590,
    GOLD_14K: 4340,
    SILVER_999: 89,
    SILVER_925: 82,
    PLATINUM_950: 3450,
  };

  for (const item of input.items) {
    const product = productsById.get(item.productId);
    if (!product || product.status !== 'ACTIVE') {
      throw new HttpError(400, `Product ${item.productId} is no longer available`);
    }

    const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) : undefined;
    if (item.variantId && !variant?.enabled) throw new HttpError(400, `${product.name} variant is unavailable`);

    const availableStock = variant ? variant.stock : product.totalStock;
    if (item.quantity < 1 || item.quantity > availableStock) {
      throw new HttpError(400, `Insufficient stock for ${product.name}`);
    }
    if (input.paymentMethod === 'COD' && !product.codAvailable) {
      throw new HttpError(400, `${product.name} is not eligible for COD`);
    }

    const rateKey = `${product.metalType}_${product.metalPurity}`;
    const rate = ratesByKey.get(rateKey) || defaultRates[rateKey] || 5000;
    metalRateSnapshotAtPlacement[rateKey] = rate;
    const priceBreakdown = calculateJewelleryPrice({
      pricingMode: product.pricingMode,
      fixedPrice: variant ? variant.price : product.fixedPrice,
      metalType: product.metalType,
      purity: product.metalPurity,
      netWeightGrams: variant ? variant.netWeightGrams : product.netWeightGrams,
      ratePerGram: rate,
      makingChargeType: product.makingChargeType,
      makingChargeValue: product.makingChargeValue,
      wastagePercentage: product.wastagePercentage,
      gemstones: product.gemstones,
      certificationCharge: product.certificationCharge,
      packagingCharge: product.packagingCharge,
      gstPercentage: product.gstPercentage,
    });

    const totalPrice = priceBreakdown.finalPrice * item.quantity;
    subtotal += totalPrice;
    gstTotal += priceBreakdown.gstAmount * item.quantity;
    orderItems.push({
      id: `item-${Date.now()}-${orderItems.length}`,
      productId: product.id,
      variantId: variant?.id,
      productName: product.name,
      variantSku: variant?.sku,
      variantDetails: item.selectedAttributes || variant?.attributes,
      image: product.images[0],
      quantity: item.quantity,
      unitPrice: priceBreakdown.finalPrice,
      totalPrice,
      priceBreakdownSnapshot: priceBreakdown,
      customEngraving: item.customEngraving,
    });
  }

  let discountAmount = 0;
  let coupon = null;
  if (input.couponCode) {
    coupon = await tx.coupon.findUnique({ where: { code: input.couponCode.trim().toUpperCase() } });
    const now = new Date();
    if (!coupon || !coupon.active || coupon.startDate > now || coupon.endDate < now || subtotal < coupon.minOrderAmount) {
      throw new HttpError(400, 'Coupon is invalid for this order');
    }
    if (coupon.discountType === 'FIXED') discountAmount = Math.min(coupon.discountValue, subtotal);
    if (coupon.discountType === 'PERCENTAGE') {
      const calculated = (subtotal * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscountAmount ? Math.min(calculated, coupon.maxDiscountAmount) : calculated;
    }
  }

  const shippingCharge = subtotal >= 2000 || coupon?.discountType === 'FREE_SHIPPING' ? 0 : 250;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCharge);

  return {
    items: orderItems,
    subtotal: Math.round(subtotal),
    discountAmount: Math.round(discountAmount),
    gstTotal: Math.round(gstTotal),
    shippingCharge,
    totalAmount: Math.round(totalAmount),
    couponCode: coupon?.code,
    metalRateSnapshotAtPlacement,
  };
};

export const buildOrderFromCheckout = (
  customer: { id: string; name: string; email: string; phone: string },
  input: CheckoutInput,
  totals: Awaited<ReturnType<typeof calculateCheckout>>
): Order => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const paymentStatus = input.paymentMethod === 'COD' ? 'PENDING' : 'PENDING';
  return {
    id: `ord-${Date.now()}`,
    orderNumber: `VED-2026-${randomNum}`,
    customer,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress || input.shippingAddress,
    items: totals.items,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    couponCode: totals.couponCode,
    gstTotal: totals.gstTotal,
    shippingCharge: totals.shippingCharge,
    totalAmount: totals.totalAmount,
    paymentMethod: input.paymentMethod,
    paymentStatus,
    orderStatus: input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT',
    placedAt: now,
    metalRateSnapshotAtPlacement: totals.metalRateSnapshotAtPlacement,
    notes: input.notes,
    history: [
      {
        status: input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT',
        timestamp: now,
        note: input.paymentMethod === 'COD' ? 'COD order placed.' : 'Payment order created.',
        updatedBy: customer.name,
      },
    ],
    gstInvoiceNumber: `INV-2026-${randomNum}`,
  };
};
