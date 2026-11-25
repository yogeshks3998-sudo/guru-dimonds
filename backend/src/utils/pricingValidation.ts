import { HttpError } from './http';
import type { BulkAdjustmentType, BulkPriceApplyRequest } from '../../../src/types';

export const VALID_ADJUSTMENT_TYPES: BulkAdjustmentType[] = [
  'MAKING_CHARGE_PER_GRAM',
  'MAKING_CHARGE_PERCENTAGE',
  'MAKING_CHARGE_FIXED',
  'MARGIN_PERCENTAGE',
  'FIXED_PRICE_AMOUNT',
  'WASTAGE_PERCENTAGE',
];

export function validateBulkPriceRequest(body: unknown): BulkPriceApplyRequest {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Invalid request payload');
  }

  const payload = body as Record<string, any>;
  const category = typeof payload.category === 'string' ? payload.category.trim() : '';
  const adjustmentType = payload.adjustmentType as BulkAdjustmentType;
  const adjustmentValue = Number(payload.adjustmentValue);

  if (!category) {
    throw new HttpError(400, 'Category is required');
  }

  if (!VALID_ADJUSTMENT_TYPES.includes(adjustmentType)) {
    throw new HttpError(400, `Invalid adjustment type. Must be one of: ${VALID_ADJUSTMENT_TYPES.join(', ')}`);
  }

  if (isNaN(adjustmentValue) || !isFinite(adjustmentValue)) {
    throw new HttpError(400, 'Adjustment value must be a valid number');
  }

  // Safety boundaries:
  if (adjustmentType === 'MAKING_CHARGE_PERCENTAGE' || adjustmentType === 'MARGIN_PERCENTAGE' || adjustmentType === 'WASTAGE_PERCENTAGE') {
    if (adjustmentValue < -100 || adjustmentValue > 500) {
      throw new HttpError(400, 'Percentage adjustment must be between -100% and +500%');
    }
  } else if (adjustmentType === 'MAKING_CHARGE_PER_GRAM' || adjustmentType === 'MAKING_CHARGE_FIXED' || adjustmentType === 'FIXED_PRICE_AMOUNT') {
    if (Math.abs(adjustmentValue) > 10_000_000) {
      throw new HttpError(400, 'Adjustment value exceeds maximum allowable threshold');
    }
  }

  return {
    category,
    adjustmentType,
    adjustmentValue,
    reason: typeof payload.reason === 'string' ? payload.reason.trim() : undefined,
    adminName: typeof payload.adminName === 'string' ? payload.adminName.trim() : undefined,
  };
}

export function validateGemstoneRateInput(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Invalid gemstone rate payload');
  }
  const payload = body as Record<string, any>;
  const gemstoneType = typeof payload.gemstoneType === 'string' ? payload.gemstoneType.trim() : '';
  const ratePerCarat = Number(payload.ratePerCarat);

  if (!gemstoneType) {
    throw new HttpError(400, 'Gemstone type is required');
  }
  if (isNaN(ratePerCarat) || ratePerCarat < 0 || !isFinite(ratePerCarat) || ratePerCarat > 50_000_000) {
    throw new HttpError(400, 'Valid positive rate per carat is required (maximum ₹50,000,000)');
  }

  return {
    gemstoneType,
    ratePerCarat,
    effectiveDate: typeof payload.effectiveDate === 'string' && payload.effectiveDate ? payload.effectiveDate : new Date().toISOString().split('T')[0],
    active: payload.active !== undefined ? Boolean(payload.active) : true,
    notes: typeof payload.notes === 'string' ? payload.notes.trim() : undefined,
    updatedBy: typeof payload.updatedBy === 'string' ? payload.updatedBy.trim() : 'Admin',
  };
}

export function validateCategoryPricingRuleInput(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Invalid category pricing rule payload');
  }
  const payload = body as Record<string, any>;
  const categoryId = typeof payload.categoryId === 'string' ? payload.categoryId.trim() : '';
  const makingChargeAdjustment = Number(payload.makingChargeAdjustment ?? 0);
  const marginPercentage = Number(payload.marginPercentage ?? 0);
  const fixedAdjustment = Number(payload.fixedAdjustment ?? 0);

  if (!categoryId) {
    throw new HttpError(400, 'Category ID or slug is required');
  }
  if (isNaN(makingChargeAdjustment) || isNaN(marginPercentage) || isNaN(fixedAdjustment)) {
    throw new HttpError(400, 'Numeric adjustments must be valid numbers');
  }

  return {
    categoryId,
    makingChargeAdjustment,
    marginPercentage,
    fixedAdjustment,
    active: payload.active !== undefined ? Boolean(payload.active) : true,
  };
}
