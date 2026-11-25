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

export const getPublishedRatesMap = async (tx: any, pairs: Array<{ metal: string; purity: string }>) => {
  const defaults: Record<string, number> = {
    GOLD_24K: 7450,
    GOLD_22K: 6830,
    GOLD_18K: 5590,
    GOLD_14K: 4340,
    SILVER_999: 89,
    SILVER_925: 82,
    PLATINUM_950: 3450,
  };

  if (!pairs.length) return new Map<string, number>();

  const uniquePairs = Array.from(
    new Set(pairs.map((p) => `${p.metal}_${p.purity}`))
  ).map((k) => {
    const [metal, purity] = k.split('_');
    return { metal, purity, status: 'PUBLISHED' };
  });

  const records = await tx.metalRate.findMany({
    where: { OR: uniquePairs },
    orderBy: { updatedAt: 'desc' },
  });

  const ratesMap = new Map<string, number>();
  for (const r of records) {
    const key = `${r.metal}_${r.purity}`;
    if (!ratesMap.has(key)) {
      ratesMap.set(key, r.ratePerGram);
    }
  }

  return ratesMap;
};

export const getPublishedRate = async (tx: any, metal: string, purity: string) => {
  const map = await getPublishedRatesMap(tx, [{ metal, purity }]);
  const key = `${metal}_${purity}`;
  const defaults: Record<string, number> = {
    GOLD_24K: 7450,
    GOLD_22K: 6830,
    GOLD_18K: 5590,
    GOLD_14K: 4340,
    SILVER_999: 89,
    SILVER_925: 82,
    PLATINUM_950: 3450,
  };
  return map.get(key) || defaults[key] || 5000;
};

export const toCartResponse = async (tx: any, cart: any) => {
  const pairs = cart.items.map((item: any) => ({
    metal: item.product.metalType,
    purity: item.product.metalPurity,
  }));

  const ratesMap = await getPublishedRatesMap(tx, pairs);
  const defaults: Record<string, number> = {
    GOLD_24K: 7450,
    GOLD_22K: 6830,
    GOLD_18K: 5590,
    GOLD_14K: 4340,
    SILVER_999: 89,
    SILVER_925: 82,
    PLATINUM_950: 3450,
  };

  const items = cart.items.map((item: any) => {
    const key = `${item.product.metalType}_${item.product.metalPurity}`;
    const rate = ratesMap.get(key) || defaults[key] || 5000;
    return toCartItemResponse(item, rate);
  });

  return {
    id: cart.id,
    customerId: cart.customerId,
    couponCode: cart.couponCode,
    items,
  };
};

