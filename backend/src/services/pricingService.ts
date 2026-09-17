import { prisma } from '../config/db';
import { HttpError } from '../utils/http';
import { calculateJewelleryPrice, DEFAULT_METAL_RATES, getRateKey } from '../../../src/utils/pricing';
import type {
  BulkAdjustmentType,
  BulkPriceApplyRequest,
  BulkPriceApplyResponse,
  BulkPricePreviewItem,
  BulkPricePreviewResponse,
  CategoryPricingRule,
  GemstoneRate,
  MetalType,
  MetalPurity,
  PricingAuditLog,
  Product,
} from '../../../src/types';
import { toProductResponse } from '../utils/serializers';

export class PricingService {
  /**
   * Helper to retrieve latest published metal rates map.
   */
  public static async getPublishedRatesMap(tx: any = prisma): Promise<Map<string, number>> {
    const publishedRates = await tx.metalRate.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
    });

    const ratesMap = new Map<string, number>();
    for (const r of publishedRates) {
      const key = `${r.metal}_${r.purity}`;
      if (!ratesMap.has(key)) {
        ratesMap.set(key, r.ratePerGram);
      }
    }

    // Populate missing standard keys with defaults
    for (const [key, val] of Object.entries(DEFAULT_METAL_RATES)) {
      if (!ratesMap.has(key)) {
        ratesMap.set(key, val);
      }
    }

    return ratesMap;
  }

  /**
   * Preview a bulk pricing adjustment for a specific category without committing changes.
   */
  public static async previewBulkAdjustment(
    category: string,
    adjustmentType: BulkAdjustmentType,
    adjustmentValue: number
  ): Promise<BulkPricePreviewResponse> {
    const products = await prisma.product.findMany({
      where: {
        category: { equals: category, mode: 'insensitive' },
        status: { in: ['ACTIVE', 'DRAFT', 'HIDDEN'] },
      },
      include: { variants: true },
      orderBy: { name: 'asc' },
    });

    if (!products.length) {
      return {
        category,
        adjustmentType,
        adjustmentValue,
        affectedProductsCount: 0,
        increasingProductsCount: 0,
        decreasingProductsCount: 0,
        unchangedProductsCount: 0,
        averagePriceChange: 0,
        totalEstimatedRevenueImpact: 0,
        items: [],
      };
    }

    const ratesMap = await this.getPublishedRatesMap();
    const items: BulkPricePreviewItem[] = [];

    let increasingCount = 0;
    let decreasingCount = 0;
    let unchangedCount = 0;
    let totalDifference = 0;

    for (const rawProduct of products) {
      const product = toProductResponse(rawProduct as any);
      const rateKey = getRateKey(product.metalType, product.metalPurity);
      const spotRate = ratesMap.get(rateKey) || 5000;

      // 1. Current Price
      const oldPriceBreakdown = calculateJewelleryPrice({
        pricingMode: product.pricingMode,
        fixedPrice: product.fixedPrice,
        metalType: product.metalType,
        purity: product.metalPurity,
        netWeightGrams: product.netWeightGrams,
        ratePerGram: spotRate,
        makingChargeType: product.makingChargeType,
        makingChargeValue: product.makingChargeValue,
        wastagePercentage: product.wastagePercentage,
        gemstones: product.gemstones,
        certificationCharge: product.certificationCharge,
        packagingCharge: product.packagingCharge,
        gstPercentage: product.gstPercentage,
      });
      const oldFinalPrice = oldPriceBreakdown.finalPrice;

      // 2. Proposed Modified Parameters
      let proposedMakingChargeType = product.makingChargeType;
      let proposedMakingChargeValue = product.makingChargeValue;
      let proposedFixedPrice = product.fixedPrice;
      let proposedWastage = product.wastagePercentage;

      if (adjustmentType === 'MAKING_CHARGE_PER_GRAM') {
        if (product.makingChargeType === 'PER_GRAM') {
          proposedMakingChargeValue = Math.max(0, product.makingChargeValue + adjustmentValue);
        } else {
          const currentEquivalentPerGram =
            product.netWeightGrams > 0
              ? oldPriceBreakdown.makingChargeTotal / product.netWeightGrams
              : product.makingChargeValue;
          proposedMakingChargeType = 'PER_GRAM';
          proposedMakingChargeValue = Math.max(0, Math.round(currentEquivalentPerGram + adjustmentValue));
        }
      } else if (adjustmentType === 'MAKING_CHARGE_FIXED') {
        if (product.makingChargeType === 'FIXED') {
          proposedMakingChargeValue = Math.max(0, product.makingChargeValue + adjustmentValue);
        } else {
          proposedMakingChargeType = 'FIXED';
          proposedMakingChargeValue = Math.max(0, Math.round(oldPriceBreakdown.makingChargeTotal + adjustmentValue));
        }
      } else if (adjustmentType === 'MAKING_CHARGE_PERCENTAGE') {
        if (product.makingChargeType === 'PERCENTAGE') {
          proposedMakingChargeValue = Math.max(0, product.makingChargeValue + adjustmentValue);
        } else {
          proposedMakingChargeValue = Math.max(
            0,
            Math.round(product.makingChargeValue * (1 + adjustmentValue / 100))
          );
        }
      } else if (adjustmentType === 'FIXED_PRICE_AMOUNT') {
        if (product.pricingMode === 'FIXED' || (product.fixedPrice && product.fixedPrice > 0)) {
          proposedFixedPrice = Math.max(0, (product.fixedPrice || oldFinalPrice) + adjustmentValue);
        }
      } else if (adjustmentType === 'WASTAGE_PERCENTAGE') {
        proposedWastage = Math.max(0, product.wastagePercentage + adjustmentValue);
      } else if (adjustmentType === 'MARGIN_PERCENTAGE') {
        // Margin adjustment shifts making charge proportionally or fixed price
        if (product.pricingMode === 'FIXED') {
          proposedFixedPrice = Math.round((product.fixedPrice || oldFinalPrice) * (1 + adjustmentValue / 100));
        } else {
          proposedMakingChargeValue = Math.round(product.makingChargeValue * (1 + adjustmentValue / 100));
        }
      }

      // 3. New Price Calculation
      const newPriceBreakdown = calculateJewelleryPrice({
        pricingMode: product.pricingMode,
        fixedPrice: proposedFixedPrice,
        metalType: product.metalType,
        purity: product.metalPurity,
        netWeightGrams: product.netWeightGrams,
        ratePerGram: spotRate,
        makingChargeType: proposedMakingChargeType,
        makingChargeValue: proposedMakingChargeValue,
        wastagePercentage: proposedWastage,
        gemstones: product.gemstones,
        certificationCharge: product.certificationCharge,
        packagingCharge: product.packagingCharge,
        gstPercentage: product.gstPercentage,
      });
      const newFinalPrice = newPriceBreakdown.finalPrice;
      const diff = newFinalPrice - oldFinalPrice;
      const pct = oldFinalPrice > 0 ? Number(((diff / oldFinalPrice) * 100).toFixed(2)) : 0;

      totalDifference += diff;
      if (diff > 0) increasingCount++;
      else if (diff < 0) decreasingCount++;
      else unchangedCount++;

      items.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        metalType: product.metalType,
        metalPurity: product.metalPurity,
        netWeightGrams: product.netWeightGrams,
        pricingMode: product.pricingMode,
        oldPrice: oldFinalPrice,
        newPrice: newFinalPrice,
        priceDifference: diff,
        percentageChange: pct,
        oldMakingChargeValue: product.makingChargeValue,
        newMakingChargeValue: proposedMakingChargeValue,
        oldFixedPrice: product.fixedPrice,
        newFixedPrice: proposedFixedPrice,
      });
    }

    return {
      category,
      adjustmentType,
      adjustmentValue,
      affectedProductsCount: items.length,
      increasingProductsCount: increasingCount,
      decreasingProductsCount: decreasingCount,
      unchangedProductsCount: unchangedCount,
      averagePriceChange: items.length > 0 ? Math.round(totalDifference / items.length) : 0,
      totalEstimatedRevenueImpact: totalDifference,
      items,
    };
  }

  /**
   * Atomically apply a bulk pricing adjustment with full audit logging.
   */
  public static async applyBulkAdjustment(
    input: BulkPriceApplyRequest,
    adminUser: string = 'Admin'
  ): Promise<BulkPriceApplyResponse> {
    const { category, adjustmentType, adjustmentValue, reason } = input;

    const products = await prisma.product.findMany({
      where: {
        category: { equals: category, mode: 'insensitive' },
      },
    });

    if (!products.length) {
      throw new HttpError(404, `No products found under category "${category}"`);
    }

    const beforeSnapshots: Array<{
      id: string;
      makingChargeType: string;
      makingChargeValue: number;
      fixedPrice: number | null;
      wastagePercentage: number;
    }> = [];

    const afterUpdates: Array<{
      id: string;
      makingChargeType: string;
      makingChargeValue: number;
      fixedPrice: number | null;
      wastagePercentage: number;
    }> = [];

    for (const p of products) {
      beforeSnapshots.push({
        id: p.id,
        makingChargeType: p.makingChargeType,
        makingChargeValue: p.makingChargeValue,
        fixedPrice: p.fixedPrice,
        wastagePercentage: p.wastagePercentage,
      });

      let proposedMakingChargeType = p.makingChargeType;
      let proposedMakingChargeValue = p.makingChargeValue;
      let proposedFixedPrice = p.fixedPrice;
      let proposedWastage = p.wastagePercentage;

      if (adjustmentType === 'MAKING_CHARGE_PER_GRAM') {
        if (p.makingChargeType === 'PER_GRAM') {
          proposedMakingChargeValue = Math.max(0, p.makingChargeValue + adjustmentValue);
        } else {
          proposedMakingChargeType = 'PER_GRAM';
          proposedMakingChargeValue = Math.max(0, p.makingChargeValue + adjustmentValue);
        }
      } else if (adjustmentType === 'MAKING_CHARGE_FIXED') {
        proposedMakingChargeType = 'FIXED';
        proposedMakingChargeValue = Math.max(0, p.makingChargeValue + adjustmentValue);
      } else if (adjustmentType === 'MAKING_CHARGE_PERCENTAGE') {
        if (p.makingChargeType === 'PERCENTAGE') {
          proposedMakingChargeValue = Math.max(0, p.makingChargeValue + adjustmentValue);
        } else {
          proposedMakingChargeValue = Math.max(
            0,
            Math.round(p.makingChargeValue * (1 + adjustmentValue / 100))
          );
        }
      } else if (adjustmentType === 'FIXED_PRICE_AMOUNT') {
        if (p.pricingMode === 'FIXED' || (p.fixedPrice && p.fixedPrice > 0)) {
          proposedFixedPrice = Math.max(0, (p.fixedPrice || 0) + adjustmentValue);
        }
      } else if (adjustmentType === 'WASTAGE_PERCENTAGE') {
        proposedWastage = Math.max(0, p.wastagePercentage + adjustmentValue);
      } else if (adjustmentType === 'MARGIN_PERCENTAGE') {
        if (p.pricingMode === 'FIXED') {
          proposedFixedPrice = Math.round((p.fixedPrice || 0) * (1 + adjustmentValue / 100));
        } else {
          proposedMakingChargeValue = Math.round(p.makingChargeValue * (1 + adjustmentValue / 100));
        }
      }

      afterUpdates.push({
        id: p.id,
        makingChargeType: proposedMakingChargeType,
        makingChargeValue: proposedMakingChargeValue,
        fixedPrice: proposedFixedPrice,
        wastagePercentage: proposedWastage,
      });
    }

    const auditLogId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await prisma.$transaction(async (tx) => {
      // 1. Update all products
      for (const update of afterUpdates) {
        await tx.product.update({
          where: { id: update.id },
          data: {
            makingChargeType: update.makingChargeType,
            makingChargeValue: update.makingChargeValue,
            fixedPrice: update.fixedPrice,
            wastagePercentage: update.wastagePercentage,
            updatedAt: new Date(),
          },
        });
      }

      // 2. Create Audit Log with complete before/after state
      await tx.pricingAuditLog.create({
        data: {
          id: auditLogId,
          action: `BULK_${adjustmentType}`,
          entityType: 'CATEGORY',
          entityId: category,
          previousValue: beforeSnapshots as any,
          newValue: afterUpdates as any,
          userId: adminUser,
          metadata: {
            category,
            adjustmentType,
            adjustmentValue,
            affectedCount: products.length,
            reason: reason || 'Bulk Category Price Adjustment',
            appliedAt: new Date().toISOString(),
          },
        },
      });
    });

    return {
      success: true,
      auditLogId,
      updatedCount: products.length,
      message: `Successfully adjusted ${products.length} products in category "${category}".`,
    };
  }

  /**
   * Safely rollback a bulk pricing operation using its audit log snapshot.
   */
  public static async rollbackBulkAdjustment(
    auditLogId: string,
    adminUser: string = 'Admin'
  ): Promise<{ success: boolean; rolledBackCount: number; message: string }> {
    const log = await prisma.pricingAuditLog.findUnique({
      where: { id: auditLogId },
    });

    if (!log) {
      throw new HttpError(404, 'Pricing audit log not found');
    }

    const snapshots = log.previousValue as Array<{
      id: string;
      makingChargeType: string;
      makingChargeValue: number;
      fixedPrice: number | null;
      wastagePercentage: number;
    }> | null;

    if (!Array.isArray(snapshots) || !snapshots.length) {
      throw new HttpError(400, 'Audit log does not contain restorable snapshot data');
    }

    const rollbackAuditId = `audit-rollback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await prisma.$transaction(async (tx) => {
      for (const snapshot of snapshots) {
        await tx.product.update({
          where: { id: snapshot.id },
          data: {
            makingChargeType: snapshot.makingChargeType,
            makingChargeValue: snapshot.makingChargeValue,
            fixedPrice: snapshot.fixedPrice,
            wastagePercentage: snapshot.wastagePercentage,
            updatedAt: new Date(),
          },
        });
      }

      await tx.pricingAuditLog.create({
        data: {
          id: rollbackAuditId,
          action: 'ROLLBACK_BULK_OPERATION',
          entityType: 'BULK_OPERATION',
          entityId: auditLogId,
          previousValue: log.newValue as any,
          newValue: snapshots as any,
          userId: adminUser,
          metadata: {
            revertedAuditLogId: auditLogId,
            originalAction: log.action,
            entityId: log.entityId,
            restoredCount: snapshots.length,
            rolledBackAt: new Date().toISOString(),
          },
        },
      });
    });

    return {
      success: true,
      rolledBackCount: snapshots.length,
      message: `Successfully rolled back operation ${auditLogId}. Restored ${snapshots.length} products.`,
    };
  }

  /**
   * Gemstone Rates Management
   */
  public static async listGemstoneRates() {
    return prisma.gemstoneRate.findMany({
      orderBy: { gemstoneType: 'asc' },
    });
  }

  public static async upsertGemstoneRate(
    data: {
      gemstoneType: string;
      ratePerCarat: number;
      effectiveDate?: string;
      active?: boolean;
      notes?: string;
      updatedBy?: string;
    },
    adminUser: string = 'Admin'
  ) {
    const dateStr = data.effectiveDate || new Date().toISOString().split('T')[0];
    const existing = await prisma.gemstoneRate.findUnique({
      where: { gemstoneType: data.gemstoneType },
    });

    const saved = await prisma.gemstoneRate.upsert({
      where: { gemstoneType: data.gemstoneType },
      create: {
        gemstoneType: data.gemstoneType,
        ratePerCarat: data.ratePerCarat,
        effectiveDate: dateStr,
        active: data.active !== undefined ? data.active : true,
        notes: data.notes,
        updatedBy: data.updatedBy || adminUser,
      },
      update: {
        ratePerCarat: data.ratePerCarat,
        effectiveDate: dateStr,
        active: data.active !== undefined ? data.active : true,
        notes: data.notes,
        updatedBy: data.updatedBy || adminUser,
      },
    });

    await prisma.pricingAuditLog.create({
      data: {
        id: `audit-gem-${Date.now()}`,
        action: existing ? 'UPDATE_GEMSTONE_RATE' : 'CREATE_GEMSTONE_RATE',
        entityType: 'GEMSTONE_RATE',
        entityId: data.gemstoneType,
        previousValue: existing as any,
        newValue: saved as any,
        userId: adminUser,
      },
    });

    return saved;
  }

  /**
   * Category Pricing Rules Management
   */
  public static async listCategoryPricingRules() {
    return prisma.categoryPricingRule.findMany({
      orderBy: { categoryId: 'asc' },
    });
  }

  public static async upsertCategoryPricingRule(
    data: {
      categoryId: string;
      makingChargeAdjustment?: number;
      marginPercentage?: number;
      fixedAdjustment?: number;
      active?: boolean;
    },
    adminUser: string = 'Admin'
  ) {
    const existing = await prisma.categoryPricingRule.findUnique({
      where: { categoryId: data.categoryId },
    });

    const saved = await prisma.categoryPricingRule.upsert({
      where: { categoryId: data.categoryId },
      create: {
        categoryId: data.categoryId,
        makingChargeAdjustment: data.makingChargeAdjustment ?? 0,
        marginPercentage: data.marginPercentage ?? 0,
        fixedAdjustment: data.fixedAdjustment ?? 0,
        active: data.active !== undefined ? data.active : true,
      },
      update: {
        makingChargeAdjustment: data.makingChargeAdjustment ?? 0,
        marginPercentage: data.marginPercentage ?? 0,
        fixedAdjustment: data.fixedAdjustment ?? 0,
        active: data.active !== undefined ? data.active : true,
      },
    });

    await prisma.pricingAuditLog.create({
      data: {
        id: `audit-catrule-${Date.now()}`,
        action: existing ? 'UPDATE_CATEGORY_PRICING_RULE' : 'CREATE_CATEGORY_PRICING_RULE',
        entityType: 'CATEGORY',
        entityId: data.categoryId,
        previousValue: existing as any,
        newValue: saved as any,
        userId: adminUser,
      },
    });

    return saved;
  }

  /**
   * Pricing Audit Logs Querying
   */
  public static async listAuditLogs(limit: number = 50) {
    return prisma.pricingAuditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 200),
    });
  }
}
