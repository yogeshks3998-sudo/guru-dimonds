import type { CartItem } from '../../../src/types';
import { calculateJewelleryPrice } from '../../../src/utils/pricing';
import { toProductResponse } from './serializers';

export const cartInclude = {
  items: {
    include: {
      product: { include: { variants: true } },
      variant: true,
    },
    orderBy: { addedAt: 'asc' as const },
  },
};

export const toCartItemResponse = (item: any, ratePerGram: number): CartItem => {
  const product = toProductResponse(item.product);
  const variant = item.variant || undefined;
  const priceBreakdown = calculateJewelleryPrice({
    pricingMode: product.pricingMode,
    fixedPrice: variant ? variant.price : product.fixedPrice,
    metalType: product.metalType,
    purity: product.metalPurity,
    netWeightGrams: variant ? variant.netWeightGrams : product.netWeightGrams,
    ratePerGram,
    makingChargeType: product.makingChargeType,
    makingChargeValue: product.makingChargeValue,
    wastagePercentage: product.wastagePercentage,
    gemstones: product.gemstones,
    certificationCharge: product.certificationCharge,
    packagingCharge: product.packagingCharge,
    gstPercentage: product.gstPercentage,
  });

  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId || undefined,
    product,
    selectedVariant: variant,
    selectedAttributes: item.selectedAttributes || {},
    quantity: item.quantity,
    unitPrice: priceBreakdown.finalPrice,
    priceBreakdown,
    metalRateSnapshot: ratePerGram,
    customEngraving: item.customEngraving || undefined,
    giftWrap: item.giftWrap,
    giftMessage: item.giftMessage || undefined,
    addedAt: new Date(item.addedAt).toISOString(),
  };
};

export const getPublishedRate = async (tx: any, metal: string, purity: string) => {
  const record = await tx.metalRate.findFirst({
    where: { metal, purity, status: 'PUBLISHED' },
    orderBy: { updatedAt: 'desc' },
  });
  if (record) return record.ratePerGram;
  const defaults: Record<string, number> = {
    GOLD_24K: 7450,
    GOLD_22K: 6830,
    GOLD_18K: 5590,
    GOLD_14K: 4340,
    SILVER_999: 89,
    SILVER_925: 82,
    PLATINUM_950: 3450,
  };
  return defaults[`${metal}_${purity}`] || 5000;
};

export const toCartResponse = async (tx: any, cart: any) => {
  const items = await Promise.all(
    cart.items.map(async (item: any) => {
      const rate = await getPublishedRate(tx, item.product.metalType, item.product.metalPurity);
      return toCartItemResponse(item, rate);
    })
  );
  return {
    id: cart.id,
    customerId: cart.customerId,
    couponCode: cart.couponCode,
    items,
  };
};

