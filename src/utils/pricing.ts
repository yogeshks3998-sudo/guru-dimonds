import { MetalType, MetalPurity, PricingMode, PriceBreakdown, GemstoneInfo } from '../types';

export const PURITY_FACTORS: Record<MetalPurity, number> = {
  '24K': 1.0,
  '22K': 22 / 24, // 0.9167
  '18K': 18 / 24, // 0.7500
  '14K': 14 / 24, // 0.5833
  '999': 1.0,
  '925': 0.925,
  '950': 0.950,
};

export const DEFAULT_METAL_RATES: Record<string, number> = {
  'GOLD_24K': 7450, // ₹7,450 / gram
  'GOLD_22K': 6830,
  'GOLD_18K': 5590,
  'GOLD_14K': 4340,
  'SILVER_999': 89, // ₹89 / gram
  'SILVER_925': 82,
  'PLATINUM_950': 3450,
};

export function getRateKey(metal: MetalType, purity: MetalPurity): string {
  return `${metal}_${purity}`;
}

export function calculateJewelleryPrice(params: {
  pricingMode: PricingMode;
  fixedPrice?: number;
  metalType: MetalType;
  purity: MetalPurity;
  netWeightGrams: number;
  ratePerGram: number;
  makingChargeType: 'FIXED' | 'PERCENTAGE' | 'PER_GRAM';
  makingChargeValue: number;
  wastagePercentage: number;
  gemstones?: GemstoneInfo[];
  certificationCharge?: number;
  packagingCharge?: number;
  discountAmount?: number;
  gstPercentage?: number;
}): PriceBreakdown {
  const {
    pricingMode,
    fixedPrice = 0,
    metalType,
    purity,
    netWeightGrams,
    ratePerGram,
    makingChargeType,
    makingChargeValue,
    wastagePercentage,
    gemstones = [],
    certificationCharge = 0,
    packagingCharge = 0,
    discountAmount = 0,
    gstPercentage = 3, // Standard 3% GST for Indian Jewellery
  } = params;

  // 1. Gemstones total
  const gemstoneValue = gemstones.reduce((sum, g) => sum + (g.totalPrice || 0), 0);

  if (pricingMode === 'FIXED') {
    const subtotal = fixedPrice;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const gstAmount = Math.round((discountedSubtotal * gstPercentage) / 100);
    const finalPrice = Math.round(discountedSubtotal + gstAmount);

    return {
      metalType,
      purity,
      netWeightGrams,
      ratePerGram,
      metalValue: subtotal,
      makingChargeType: 'FIXED',
      makingChargeValue: 0,
      makingChargeTotal: 0,
      wastagePercentage: 0,
      wastageValue: 0,
      gemstoneValue,
      certificationCharge,
      packagingCharge,
      subtotal,
      discount: discountAmount,
      discountedSubtotal,
      gstPercentage,
      gstAmount,
      finalPrice,
      calculatedAt: new Date().toISOString(),
    };
  }

  // Formula / Rate-Linked mode calculation:
  // Metal Value = Net Weight * Rate Per Gram * Purity Factor
  const purityFactor = PURITY_FACTORS[purity] || 1.0;
  const metalValue = Math.round(netWeightGrams * ratePerGram * purityFactor);

  // Making Charge Total
  let makingChargeTotal = 0;
  if (makingChargeType === 'FIXED') {
    makingChargeTotal = makingChargeValue;
  } else if (makingChargeType === 'PERCENTAGE') {
    makingChargeTotal = Math.round((metalValue * makingChargeValue) / 100);
  } else if (makingChargeType === 'PER_GRAM') {
    makingChargeTotal = Math.round(netWeightGrams * makingChargeValue);
  }

  // Wastage Charge
  const wastageValue = Math.round((metalValue * wastagePercentage) / 100);

  // Subtotal
  const subtotal = Math.round(
    metalValue + makingChargeTotal + wastageValue + gemstoneValue + certificationCharge + packagingCharge
  );

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round((discountedSubtotal * gstPercentage) / 100);
  const finalPrice = Math.round(discountedSubtotal + gstAmount);

  return {
    metalType,
    purity,
    netWeightGrams,
    ratePerGram,
    metalValue,
    makingChargeType,
    makingChargeValue,
    makingChargeTotal,
    wastagePercentage,
    wastageValue,
    gemstoneValue,
    certificationCharge,
    packagingCharge,
    subtotal,
    discount: discountAmount,
    discountedSubtotal,
    gstPercentage,
    gstAmount,
    finalPrice,
    calculatedAt: new Date().toISOString(),
  };
}
