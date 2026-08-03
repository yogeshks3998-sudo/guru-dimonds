import type { Address, Order, OrderItem } from '../../../src/types';
import { calculateJewelleryPrice } from '../../../src/utils/pricing';
import { HttpError } from './http';
import { getPublishedRate } from './cart';
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

  for (const item of input.items) {
    const productRecord = await tx.product.findUnique({
      where: { id: item.productId },
      include: { variants: true },
    });
    if (!productRecord || productRecord.status !== 'ACTIVE') {
      throw new HttpError(400, `Product ${item.productId} is no longer available`);
    }

    const product = toProductResponse(productRecord);
    const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) : undefined;
    if (item.variantId && !variant?.enabled) throw new HttpError(400, `${product.name} variant is unavailable`);

    const availableStock = variant ? variant.stock : product.totalStock;
    if (item.quantity < 1 || item.quantity > availableStock) {
      throw new HttpError(400, `Insufficient stock for ${product.name}`);
    }
    if (input.paymentMethod === 'COD' && !product.codAvailable) {
      throw new HttpError(400, `${product.name} is not eligible for COD`);
    }

    const rate = await getPublishedRate(tx, product.metalType, product.metalPurity);
    metalRateSnapshotAtPlacement[`${product.metalType}_${product.metalPurity}`] = rate;
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
