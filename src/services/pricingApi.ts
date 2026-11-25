import { apiRequest, jsonRequest, API_BASE_URL } from './api';
import type {
  BulkPriceApplyRequest,
  BulkPriceApplyResponse,
  BulkPricePreviewResponse,
  CategoryPricingRule,
  GemstoneRate,
  PricingAuditLog,
} from '../types';

export const pricingApi = {
  previewBulkAdjustment: (data: { category: string; adjustmentType: string; adjustmentValue: number }) =>
    jsonRequest<BulkPricePreviewResponse>('/pricing/bulk/preview', 'POST', data),

  applyBulkAdjustment: (data: BulkPriceApplyRequest) =>
    jsonRequest<BulkPriceApplyResponse>('/pricing/bulk/apply', 'POST', data),

  rollbackBulkAdjustment: (auditLogId: string) =>
    jsonRequest<{ success: boolean; rolledBackCount: number; message: string }>(
      `/pricing/bulk/rollback/${encodeURIComponent(auditLogId)}`,
      'POST',
      {}
    ),

  listGemstoneRates: () => apiRequest<GemstoneRate[]>('/pricing/gemstones'),

  saveGemstoneRate: (data: {
    gemstoneType: string;
    ratePerCarat: number;
    effectiveDate?: string;
    active?: boolean;
    notes?: string;
  }) => jsonRequest<GemstoneRate>('/pricing/gemstones', 'POST', data),

  listCategoryPricingRules: () => apiRequest<CategoryPricingRule[]>('/pricing/categories'),

  saveCategoryPricingRule: (data: {
    categoryId: string;
    makingChargeAdjustment?: number;
    marginPercentage?: number;
    fixedAdjustment?: number;
    active?: boolean;
  }) => jsonRequest<CategoryPricingRule>('/pricing/categories', 'POST', data),

  listPricingAuditLogs: (limit: number = 50) =>
    apiRequest<PricingAuditLog[]>(`/pricing/audit-logs?limit=${limit}`),

  getExportAuditLogsUrl: () => `${API_BASE_URL}/pricing/audit-logs/export`,
};
