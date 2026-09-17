import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useProductStore } from '../../stores/useProductStore';
import { pricingApi } from '../../services/pricingApi';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';
import {
  Coins,
  Layers,
  Sparkles,
  Sliders,
  History,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Save,
  Search,
  Eye,
  ArrowRight,
  ShieldCheck,
  Diamond,
} from 'lucide-react';
import type {
  BulkAdjustmentType,
  BulkPricePreviewResponse,
  CategoryPricingRule,
  GemstoneRate,
  MetalType,
  MetalPurity,
  PricingAuditLog,
} from '../../types';

export const AdminPricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metal' | 'category' | 'gemstones' | 'bulk' | 'audit'>('bulk');
  const { rates, publishBatchRates, hydrateMetalRates, loading: metalLoading } = useMetalRateStore();
  const { categories } = useCategoryStore();
  const { products, hydrateProducts } = useProductStore();
  const { showToast } = useToast();

  // Metal Rates Local State
  const [localRates, setLocalRates] = useState(rates);
  const [percentageAdjustment, setPercentageAdjustment] = useState<number>(0);
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [hasUnsavedRates, setHasUnsavedRates] = useState(false);

  // Gemstone Rates State
  const [gemstoneRates, setGemstoneRates] = useState<GemstoneRate[]>([]);
  const [loadingGemstones, setLoadingGemstones] = useState(false);
  const [selectedGemType, setSelectedGemType] = useState('Diamond (Round)');
  const [gemRateInput, setGemRateInput] = useState<number>(85000);
  const [gemNotes, setGemNotes] = useState('');

  // Category Rules State
  const [categoryRules, setCategoryRules] = useState<CategoryPricingRule[]>([]);
  const [loadingCategoryRules, setLoadingCategoryRules] = useState(false);
  const [selectedCategoryForRule, setSelectedCategoryForRule] = useState<string>('');
  const [makingChargeAdj, setMakingChargeAdj] = useState<number>(0);
  const [marginPct, setMarginPct] = useState<number>(0);
  const [fixedAdj, setFixedAdj] = useState<number>(0);

  // Bulk Operations State
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkAdjType, setBulkAdjType] = useState<BulkAdjustmentType>('MAKING_CHARGE_PER_GRAM');
  const [bulkAdjValue, setBulkAdjValue] = useState<number>(200);
  const [bulkReason, setBulkReason] = useState<string>('Seasonal Festival Margin Adjustment');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [previewResult, setPreviewResult] = useState<BulkPricePreviewResponse | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<PricingAuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<PricingAuditLog | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);

  // Synchronize Metal Rates
  useEffect(() => {
    if (rates && rates.length > 0 && !hasUnsavedRates) {
      setLocalRates(rates);
    }
  }, [rates, hasUnsavedRates]);

  // Set default bulk category when categories load
  useEffect(() => {
    if (categories.length > 0 && !bulkCategory) {
      setBulkCategory(categories[0].name);
    }
    if (categories.length > 0 && !selectedCategoryForRule) {
      setSelectedCategoryForRule(categories[0].name);
    }
  }, [categories, bulkCategory, selectedCategoryForRule]);

  // Load Gemstones, Category Rules, and Audit Logs
  const loadGemstones = async () => {
    setLoadingGemstones(true);
    try {
      const data = await pricingApi.listGemstoneRates();
      setGemstoneRates(data);
    } catch {
      // Fallback
    } finally {
      setLoadingGemstones(false);
    }
  };

  const loadCategoryRules = async () => {
    setLoadingCategoryRules(true);
    try {
      const data = await pricingApi.listCategoryPricingRules();
      setCategoryRules(data);
    } catch {
      // Fallback
    } finally {
      setLoadingCategoryRules(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const data = await pricingApi.listPricingAuditLogs(50);
      setAuditLogs(data);
    } catch {
      // Fallback
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gemstones') void loadGemstones();
    if (activeTab === 'category') void loadCategoryRules();
    if (activeTab === 'audit') void loadAuditLogs();
  }, [activeTab]);

  // Handle Metal Rates
  const handleRateChange = (metal: MetalType, purity: MetalPurity, newRate: number) => {
    setHasUnsavedRates(true);
    setLocalRates((prev) =>
      prev.map((r) => (r.metal === metal && r.purity === purity ? { ...r, ratePerGram: newRate } : r))
    );
  };

  const handleApplyPercentage = (percent: number) => {
    setPercentageAdjustment(percent);
    setHasUnsavedRates(true);
    setLocalRates((prev) =>
      prev.map((r) => ({
        ...r,
        ratePerGram: Math.round(r.ratePerGram * (1 + percent / 100)),
      }))
    );
  };

  const handleSaveMetalRates = async () => {
    setIsSavingRates(true);
    try {
      await publishBatchRates(
        localRates.map((r) => ({
          metal: r.metal,
          purity: r.purity,
          ratePerGram: r.ratePerGram,
          notes:
            percentageAdjustment !== 0
              ? `Bulk shift of ${percentageAdjustment > 0 ? `+${percentageAdjustment}%` : `${percentageAdjustment}%`}`
              : 'Manual Admin Update',
        }))
      );
      setHasUnsavedRates(false);
      showToast('Live Bullion Rates Published', 'Catalog formula prices have been updated across the storefront.');
    } catch (err) {
      showToast('Update Failed', err instanceof Error ? err.message : 'Unable to publish rates', 'error');
    } finally {
      setIsSavingRates(false);
    }
  };

  // Handle Gemstone Rate Save
  const handleSaveGemstoneRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await pricingApi.saveGemstoneRate({
        gemstoneType: selectedGemType,
        ratePerCarat: gemRateInput,
        notes: gemNotes,
      });
      setGemstoneRates((prev) => {
        const idx = prev.findIndex((g) => g.gemstoneType === saved.gemstoneType);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [...prev, saved];
      });
      showToast('Gemstone Rate Updated', `${saved.gemstoneType} set to ${formatINR(saved.ratePerCarat)}/carat.`);
    } catch (err) {
      showToast('Save Failed', err instanceof Error ? err.message : 'Unable to save gemstone rate', 'error');
    }
  };

  // Handle Category Rule Save
  const handleSaveCategoryRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await pricingApi.saveCategoryPricingRule({
        categoryId: selectedCategoryForRule,
        makingChargeAdjustment: makingChargeAdj,
        marginPercentage: marginPct,
        fixedAdjustment: fixedAdj,
      });
      setCategoryRules((prev) => {
        const idx = prev.findIndex((r) => r.categoryId === saved.categoryId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [...prev, saved];
      });
      showToast('Category Rule Saved', `Pricing rule for ${saved.categoryId} successfully updated.`);
    } catch (err) {
      showToast('Save Failed', err instanceof Error ? err.message : 'Unable to save category rule', 'error');
    }
  };

  // Handle Bulk Preview
  const handlePreviewBulk = async () => {
    if (!bulkCategory) {
      alert('Please select a category.');
      return;
    }
    setIsPreviewing(true);
    setPreviewResult(null);
    try {
      const preview = await pricingApi.previewBulkAdjustment({
        category: bulkCategory,
        adjustmentType: bulkAdjType,
        adjustmentValue: bulkAdjValue,
      });
      setPreviewResult(preview);
      showToast('Preview Generated', `Calculated price impact for ${preview.affectedProductsCount} items.`);
    } catch (err) {
      showToast('Preview Failed', err instanceof Error ? err.message : 'Unable to generate preview', 'error');
    } finally {
      setIsPreviewing(false);
    }
  };

  // Handle Bulk Apply
  const handleApplyBulk = async () => {
    if (!previewResult) return;
    if (
      !confirm(
        `Are you sure you want to apply this adjustment to ${previewResult.affectedProductsCount} products in category "${bulkCategory}"? All updates will be atomically committed and logged for rollback.`
      )
    ) {
      return;
    }

    setIsApplyingBulk(true);
    try {
      const result = await pricingApi.applyBulkAdjustment({
        category: bulkCategory,
        adjustmentType: bulkAdjType,
        adjustmentValue: bulkAdjValue,
        reason: bulkReason,
      });

      showToast('Bulk Adjustment Applied', result.message);
      setPreviewResult(null);
      await hydrateProducts();
      await loadAuditLogs();
    } catch (err) {
      showToast('Apply Failed', err instanceof Error ? err.message : 'Unable to apply bulk adjustment', 'error');
    } finally {
      setIsApplyingBulk(false);
    }
  };

  // Handle Rollback
  const handleRollback = async (auditLogId: string) => {
    if (!confirm(`Are you sure you want to rollback operation ${auditLogId}? This will restore all product pricing parameters to their exact prior values.`)) {
      return;
    }
    setIsRollingBack(auditLogId);
    try {
      const result = await pricingApi.rollbackBulkAdjustment(auditLogId);
      showToast('Rollback Complete', result.message);
      await hydrateProducts();
      await loadAuditLogs();
    } catch (err) {
      showToast('Rollback Failed', err instanceof Error ? err.message : 'Unable to rollback operation', 'error');
    } finally {
      setIsRollingBack(null);
    }
  };

  const filteredAuditLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.entityId.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.userId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <AdminLayout activeTab="pricing">
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Enterprise Pricing Engine</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ERP Safe Mode
              </span>
            </div>
            <p className="text-xs text-[#6F6A62] mt-1">
              Centralized jewellery pricing management with transactional bulk shifts, live formula preview, and audit rollbacks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                void hydrateMetalRates();
                void hydrateProducts();
                if (activeTab === 'gemstones') void loadGemstones();
                if (activeTab === 'category') void loadCategoryRules();
                if (activeTab === 'audit') void loadAuditLogs();
                showToast('Catalog Refreshed', 'Synced with database.');
              }}
              className="px-4 py-2.5 bg-white border border-[#E7E1D7] hover:bg-[#FAF8F3] text-[#1B1A18] text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#A67C32]" /> Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E7E1D7] pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'bulk'
                ? 'bg-[#A67C32] text-white shadow-md'
                : 'bg-white text-[#6F6A62] hover:text-[#1B1A18] border border-[#E7E1D7]'
            }`}
          >
            <Sliders className="w-4 h-4" /> 1. Bulk Category Adjustments
          </button>
          <button
            onClick={() => setActiveTab('metal')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'metal'
                ? 'bg-[#A67C32] text-white shadow-md'
                : 'bg-white text-[#6F6A62] hover:text-[#1B1A18] border border-[#E7E1D7]'
            }`}
          >
            <Coins className="w-4 h-4" /> 2. Live Metal Rates
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'category'
                ? 'bg-[#A67C32] text-white shadow-md'
                : 'bg-white text-[#6F6A62] hover:text-[#1B1A18] border border-[#E7E1D7]'
            }`}
          >
            <Layers className="w-4 h-4" /> 3. Category Rules
          </button>
          <button
            onClick={() => setActiveTab('gemstones')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'gemstones'
                ? 'bg-[#A67C32] text-white shadow-md'
                : 'bg-white text-[#6F6A62] hover:text-[#1B1A18] border border-[#E7E1D7]'
            }`}
          >
            <Diamond className="w-4 h-4" /> 4. Gemstone Rates
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-[#A67C32] text-white shadow-md'
                : 'bg-white text-[#6F6A62] hover:text-[#1B1A18] border border-[#E7E1D7]'
            }`}
          >
            <History className="w-4 h-4" /> 5. Audit Trail & Rollback
          </button>
        </div>

        {/* TAB 1: BULK CATEGORY OPERATIONS */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Form */}
              <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm text-xs">
                <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#A67C32]" /> Bulk Adjustment Configuration
                </h3>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Target Category</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({products.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length} products)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Adjustment Type</label>
                  <select
                    value={bulkAdjType}
                    onChange={(e) => setBulkAdjType(e.target.value as BulkAdjustmentType)}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="MAKING_CHARGE_PER_GRAM">Making Charge (+/- ₹ per gram)</option>
                    <option value="MAKING_CHARGE_FIXED">Making Charge (+/- ₹ Fixed)</option>
                    <option value="MAKING_CHARGE_PERCENTAGE">Making Charge (+/- % Percentage)</option>
                    <option value="MARGIN_PERCENTAGE">Overall Margin (+/- % Percentage)</option>
                    <option value="FIXED_PRICE_AMOUNT">Fixed Price Items (+/- ₹ Amount)</option>
                    <option value="WASTAGE_PERCENTAGE">Wastage (+/- % Percentage)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">
                    Adjustment Value ({bulkAdjType.includes('PERCENTAGE') ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    step={bulkAdjType.includes('PERCENTAGE') ? '0.1' : '1'}
                    value={bulkAdjValue}
                    onChange={(e) => setBulkAdjValue(Number(e.target.value))}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold font-mono text-[#A67C32]"
                  />
                  <span className="text-[10px] text-[#6F6A62] mt-0.5 block">
                    Use positive values to increase, negative values to decrease (e.g. +200 or -50).
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Adjustment Reason (for Audit Log)</label>
                  <input
                    type="text"
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. Festival Making Charge Offer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePreviewBulk}
                    disabled={isPreviewing}
                    className="w-full py-3 bg-[#1B1A18] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4 text-[#D8C29D]" />
                    {isPreviewing ? 'Calculating Simulation...' : 'Preview Price Impact'}
                  </button>
                </div>
              </div>

              {/* Impact Overview Card */}
              <div className="lg:col-span-2 bg-[#FAF3E6] border border-[#D8C29D] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-[#D8C29D] pb-3 mb-4">
                    <h3 className="font-serif font-bold text-base text-[#1B1A18] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A67C32]" /> Simulation & Impact Summary
                    </h3>
                    {previewResult && (
                      <span className="text-xs font-bold bg-white text-[#A67C32] px-2.5 py-0.5 rounded-full border border-[#D8C29D]">
                        Category: {previewResult.category}
                      </span>
                    )}
                  </div>

                  {!previewResult ? (
                    <div className="py-12 text-center text-xs text-[#6F6A62] space-y-2">
                      <Sliders className="w-8 h-8 text-[#A67C32] mx-auto opacity-40" />
                      <p className="font-semibold text-[#1B1A18]">No preview generated yet.</p>
                      <p>Select a category and adjustment value, then click "Preview Price Impact" to simulate.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-[#D8C29D]">
                          <span className="text-[10px] text-[#6F6A62] block">Affected Products</span>
                          <span className="font-serif font-bold text-lg text-[#1B1A18]">
                            {previewResult.affectedProductsCount}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-[#D8C29D]">
                          <span className="text-[10px] text-[#2E7D5B] block flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Price Increases
                          </span>
                          <span className="font-serif font-bold text-lg text-[#2E7D5B]">
                            {previewResult.increasingProductsCount}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-[#D8C29D]">
                          <span className="text-[10px] text-[#B43C3C] block flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Price Decreases
                          </span>
                          <span className="font-serif font-bold text-lg text-[#B43C3C]">
                            {previewResult.decreasingProductsCount}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-[#D8C29D]">
                          <span className="text-[10px] text-[#6F6A62] block">Average Delta</span>
                          <span className="font-serif font-bold text-lg text-[#A67C32]">
                            {previewResult.averagePriceChange >= 0
                              ? `+${formatINR(previewResult.averagePriceChange)}`
                              : formatINR(previewResult.averagePriceChange)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#D8C29D] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[#6F6A62] block">Total Estimated Catalogue Revenue Impact:</span>
                          <span className="font-bold text-sm text-[#1B1A18]">
                            {previewResult.totalEstimatedRevenueImpact >= 0
                              ? `+${formatINR(previewResult.totalEstimatedRevenueImpact)}`
                              : formatINR(previewResult.totalEstimatedRevenueImpact)}
                          </span>
                        </div>
                        <span className="text-[10px] bg-[#E6F4EA] text-[#2E7D5B] font-bold px-2 py-1 rounded-md border border-[#2E7D5B]">
                          Transaction Safe
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {previewResult && (
                  <div className="pt-4 border-t border-[#D8C29D] flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewResult(null)}
                      className="px-4 py-2.5 bg-white border border-[#D8C29D] hover:bg-[#FAF8F3] text-xs font-bold rounded-xl"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyBulk}
                      disabled={isApplyingBulk}
                      className="px-6 py-2.5 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isApplyingBulk ? 'Committing Updates...' : 'Apply & Commit to Database'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Table */}
            {previewResult && previewResult.items.length > 0 && (
              <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
                <h4 className="font-serif font-bold text-base text-[#1B1A18]">
                  Simulated Line-Item Price Deltas ({previewResult.items.length} Products)
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1B1A18]">
                    <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Weight / Spec</th>
                        <th className="p-3">Old Price</th>
                        <th className="p-3">New Price</th>
                        <th className="p-3">Price Difference</th>
                        <th className="p-3">% Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E1D7]">
                      {previewResult.items.map((item) => (
                        <tr key={item.productId} className="hover:bg-[#FAF8F3] transition-colors">
                          <td className="p-3 font-bold">{item.productName}</td>
                          <td className="p-3 font-mono text-[#6F6A62]">{item.sku}</td>
                          <td className="p-3 text-[#6F6A62]">
                            {item.netWeightGrams}g ({item.metalPurity} {item.metalType})
                          </td>
                          <td className="p-3 text-[#6F6A62] line-through">{formatINR(item.oldPrice)}</td>
                          <td className="p-3 font-bold text-[#A67C32]">{formatINR(item.newPrice)}</td>
                          <td className="p-3 font-bold">
                            <span
                              className={
                                item.priceDifference > 0
                                  ? 'text-[#2E7D5B]'
                                  : item.priceDifference < 0
                                  ? 'text-[#B43C3C]'
                                  : 'text-[#6F6A62]'
                              }
                            >
                              {item.priceDifference > 0
                                ? `+${formatINR(item.priceDifference)}`
                                : formatINR(item.priceDifference)}
                            </span>
                          </td>
                          <td className="p-3 font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                item.percentageChange > 0
                                  ? 'bg-[#E6F4EA] text-[#2E7D5B]'
                                  : item.percentageChange < 0
                                  ? 'bg-[#FFF5F5] text-[#B43C3C]'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {item.percentageChange > 0 ? `+${item.percentageChange}%` : `${item.percentageChange}%`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE METAL RATES */}
        {activeTab === 'metal' && (
          <div className="space-y-6">
            {/* Quick Shift Bar */}
            <div className="bg-gradient-to-r from-[#FAF3E6] to-[#FFF9F0] border border-[#D8C29D] rounded-2xl p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A67C32]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#A67C32]">
                    Bulk Rate Shift Presets
                  </span>
                </div>
                {hasUnsavedRates && (
                  <span className="text-xs font-semibold text-[#A67C32] animate-pulse">
                    Unsaved Rate Changes Pending. Click "Save & Publish" to go live.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-[#1B1A18] mr-1">Shift All Rates By:</span>
                {[-5, -2, -1, 0.5, 1, 2, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleApplyPercentage(pct)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                      percentageAdjustment === pct && hasUnsavedRates
                        ? 'bg-[#A67C32] text-white border-[#A67C32] shadow-sm'
                        : 'bg-white border-[#D8C29D] hover:bg-[#FAF3E6] text-[#1B1A18]'
                    }`}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleSaveMetalRates}
                  disabled={!hasUnsavedRates || isSavingRates}
                  className="px-4 py-1.5 bg-[#1B1A18] hover:bg-[#333] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 ml-auto"
                >
                  <Save className="w-3.5 h-3.5 text-[#D8C29D]" />
                  <span>{isSavingRates ? 'Publishing...' : 'Save & Publish Rates'}</span>
                </button>
              </div>
            </div>

            {/* Rates Table */}
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Active Bullion Rate Card</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1B1A18]">
                  <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                    <tr>
                      <th className="p-3">Metal</th>
                      <th className="p-3">Purity Standard</th>
                      <th className="p-3">Purity %</th>
                      <th className="p-3">Current Spot Rate (/g)</th>
                      <th className="p-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E1D7]">
                    {localRates.map((rate, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F3] transition-colors">
                        <td className="p-3 font-bold uppercase text-[#A67C32]">{rate.metal}</td>
                        <td className="p-3 font-semibold">{rate.purity}</td>
                        <td className="p-3 text-[#6F6A62]">
                          {rate.purity === '24K'
                            ? '99.9%'
                            : rate.purity === '22K'
                            ? '91.6%'
                            : rate.purity === '18K'
                            ? '75.0%'
                            : rate.purity === '14K'
                            ? '58.5%'
                            : rate.purity === '999'
                            ? '99.9%'
                            : '92.5%'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">₹</span>
                            <input
                              type="number"
                              value={rate.ratePerGram}
                              onChange={(e) => handleRateChange(rate.metal, rate.purity, Number(e.target.value))}
                              className="w-32 bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2.5 py-1.5 font-bold font-mono text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                            />
                            <span className="text-[#6F6A62]">/g</span>
                          </div>
                        </td>
                        <td className="p-3 text-[#6F6A62]">{formatDate(rate.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORY PRICING RULES */}
        {activeTab === 'category' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveCategoryRule}
              className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm text-xs"
            >
              <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#A67C32]" /> Set Category Rule
              </h3>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Select Category</label>
                <select
                  value={selectedCategoryForRule}
                  onChange={(e) => setSelectedCategoryForRule(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Making Charge Shift (₹/g)</label>
                <input
                  type="number"
                  value={makingChargeAdj}
                  onChange={(e) => setMakingChargeAdj(Number(e.target.value))}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  placeholder="e.g. +200"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Category Margin Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={marginPct}
                  onChange={(e) => setMarginPct(Number(e.target.value))}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  placeholder="e.g. +5"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Fixed Price Items Adjustment (₹)</label>
                <input
                  type="number"
                  value={fixedAdj}
                  onChange={(e) => setFixedAdj(Number(e.target.value))}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  placeholder="e.g. +1000"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Category Rule
              </button>
            </form>

            <div className="lg:col-span-2 bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm text-xs">
              <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2">
                Active Category Pricing Rules ({categoryRules.length})
              </h3>

              {categoryRules.length === 0 ? (
                <p className="text-[#6F6A62] py-8 text-center">No specific category overrides saved.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Making Charge Adj</th>
                        <th className="p-3">Margin %</th>
                        <th className="p-3">Fixed Adj</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E1D7]">
                      {categoryRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-[#FAF8F3]">
                          <td className="p-3 font-bold">{rule.categoryId}</td>
                          <td className="p-3 font-bold text-[#A67C32]">+{formatINR(rule.makingChargeAdjustment)}/g</td>
                          <td className="p-3 font-bold text-[#2E7D5B]">+{rule.marginPercentage}%</td>
                          <td className="p-3 font-bold">+{formatINR(rule.fixedAdjustment)}</td>
                          <td className="p-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#2E7D5B]">
                              ACTIVE
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: GEMSTONE RATES */}
        {activeTab === 'gemstones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveGemstoneRate}
              className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm text-xs"
            >
              <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2 flex items-center gap-2">
                <Diamond className="w-4 h-4 text-[#A67C32]" /> Gemstone Rate Card
              </h3>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Gemstone / Diamond Type</label>
                <input
                  type="text"
                  value={selectedGemType}
                  onChange={(e) => setSelectedGemType(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  placeholder="e.g. Diamond (Round VVS1), Ruby, Emerald"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Rate Per Carat (₹)</label>
                <input
                  type="number"
                  value={gemRateInput}
                  onChange={(e) => setGemRateInput(Number(e.target.value))}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold font-mono text-[#A67C32]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Notes / Certification Source</label>
                <input
                  type="text"
                  value={gemNotes}
                  onChange={(e) => setGemNotes(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  placeholder="e.g. SGL Certified Wholesale Spot"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Gemstone Rate
              </button>
            </form>

            <div className="lg:col-span-2 bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm text-xs">
              <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2">
                Active Gemstone & Diamond Rates ({gemstoneRates.length})
              </h3>

              {gemstoneRates.length === 0 ? (
                <p className="text-[#6F6A62] py-8 text-center">No gemstone rates registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                      <tr>
                        <th className="p-3">Gemstone</th>
                        <th className="p-3">Rate Per Carat</th>
                        <th className="p-3">Effective Date</th>
                        <th className="p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E1D7]">
                      {gemstoneRates.map((gem) => (
                        <tr key={gem.id} className="hover:bg-[#FAF8F3]">
                          <td className="p-3 font-bold flex items-center gap-2">
                            <Diamond className="w-3.5 h-3.5 text-[#A67C32]" />
                            {gem.gemstoneType}
                          </td>
                          <td className="p-3 font-bold font-mono text-[#A67C32]">
                            {formatINR(gem.ratePerCarat)}/ct
                          </td>
                          <td className="p-3 text-[#6F6A62]">{gem.effectiveDate}</td>
                          <td className="p-3 text-[#6F6A62]">{gem.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS & ROLLBACK */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E7E1D7] shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#6F6A62] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by action, category, or user..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                />
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={pricingApi.getExportAuditLogsUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#FAF3E6] hover:bg-[#F2E8D5] text-[#A67C32] border border-[#D8C29D] text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Export Audit CSV
                </a>
              </div>
            </div>

            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm text-xs">
              <h3 className="font-serif font-bold text-base text-[#1B1A18]">
                Immutable Pricing Operation Log ({filteredAuditLogs.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Entity</th>
                      <th className="p-3">Admin User</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E1D7]">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF8F3]">
                        <td className="p-3 font-mono text-[#6F6A62]">{formatDate(log.timestamp)}</td>
                        <td className="p-3 font-bold">
                          <span className="bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D] px-2 py-0.5 rounded-full text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 font-bold">{log.entityId}</td>
                        <td className="p-3 text-[#6F6A62]">{log.userId}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {log.action.startsWith('BULK_') && (
                              <button
                                onClick={() => handleRollback(log.id)}
                                disabled={isRollingBack === log.id}
                                className="px-3 py-1 bg-[#33181A] hover:bg-[#4A1D20] text-red-300 text-[10px] font-bold rounded-lg border border-red-900/40 flex items-center gap-1 transition-all disabled:opacity-50"
                                title="Atomically restore previous product parameters"
                              >
                                <RotateCcw className="w-3 h-3" />
                                {isRollingBack === log.id ? 'Reverting...' : 'Rollback'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPricingPage;
