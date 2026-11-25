import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/http';
import { requireRole } from '../middleware/auth';
import { PricingService } from '../services/pricingService';
import {
  validateBulkPriceRequest,
  validateCategoryPricingRuleInput,
  validateGemstoneRateInput,
} from '../utils/pricingValidation';

export const pricingRouter = Router();

// 1. Bulk Operations - Preview Before Apply
pricingRouter.post(
  '/pricing/bulk/preview',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const validated = validateBulkPriceRequest(req.body);
    const preview = await PricingService.previewBulkAdjustment(
      validated.category,
      validated.adjustmentType,
      validated.adjustmentValue
    );
    res.json(preview);
  })
);

// 2. Bulk Operations - Apply Adjustment
pricingRouter.post(
  '/pricing/bulk/apply',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const validated = validateBulkPriceRequest(req.body);
    const adminUser = req.auth?.email || validated.adminName || 'Admin Owner';
    const result = await PricingService.applyBulkAdjustment(validated, adminUser);
    res.status(200).json(result);
  })
);

// 3. Bulk Operations - One-Click Rollback
pricingRouter.post(
  '/pricing/bulk/rollback/:auditLogId',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const auditLogId = String(req.params.auditLogId);
    const adminUser = req.auth?.email || 'Admin Owner';
    const result = await PricingService.rollbackBulkAdjustment(auditLogId, adminUser);
    res.status(200).json(result);
  })
);

// 4. Gemstone Rates CRUD
pricingRouter.get(
  '/pricing/gemstones',
  asyncHandler(async (_req, res) => {
    const rates = await PricingService.listGemstoneRates();
    res.json(rates);
  })
);

pricingRouter.post(
  '/pricing/gemstones',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const validated = validateGemstoneRateInput(req.body);
    const adminUser = req.auth?.email || validated.updatedBy || 'Admin Owner';
    const saved = await PricingService.upsertGemstoneRate(validated, adminUser);
    res.status(201).json(saved);
  })
);

// 5. Category Pricing Rules CRUD
pricingRouter.get(
  '/pricing/categories',
  asyncHandler(async (_req, res) => {
    const rules = await PricingService.listCategoryPricingRules();
    res.json(rules);
  })
);

pricingRouter.post(
  '/pricing/categories',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const validated = validateCategoryPricingRuleInput(req.body);
    const adminUser = req.auth?.email || 'Admin Owner';
    const saved = await PricingService.upsertCategoryPricingRule(validated, adminUser);
    res.status(201).json(saved);
  })
);

// 6. Pricing Audit Logs Query & Export
pricingRouter.get(
  '/pricing/audit-logs',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 50);
    const logs = await PricingService.listAuditLogs(limit);
    res.json(logs);
  })
);

pricingRouter.get(
  '/pricing/audit-logs/export',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (_req, res) => {
    const logs = await PricingService.listAuditLogs(200);
    const csvHeader = 'ID,Action,EntityType,EntityID,UserID,Timestamp\n';
    const csvRows = logs
      .map(
        (l) =>
          `"${l.id}","${l.action}","${l.entityType}","${l.entityId}","${l.userId}","${l.timestamp.toISOString()}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pricing_audit_logs.csv"');
    res.send(csvHeader + csvRows);
  })
);
