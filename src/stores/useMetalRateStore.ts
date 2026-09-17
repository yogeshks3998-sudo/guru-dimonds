import { create } from 'zustand';
import { MetalRate, MetalType, MetalPurity } from '../types';
import { INITIAL_METAL_RATES } from '../data/mockData';
import { getRateKey } from '../utils/pricing';
import { metalRateApi } from '../services/metalRateApi';

const STORAGE_KEY = 'guru_diamonds_metal_rates_v1';

const loadRatesFromStorage = (): MetalRate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore storage errors
  }
  return INITIAL_METAL_RATES;
};

const saveRatesToStorage = (rates: MetalRate[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch {
    // Ignore storage errors
  }
};

interface RateImpactSummary {
  affectedProductsCount: number;
  increasingProductsCount: number;
  decreasingProductsCount: number;
  averagePriceChange: number;
  largestPriceIncrease: number;
  largestPriceDecrease: number;
  excludedFixedPriceProducts: number;
}

interface MetalRateState {
  rates: MetalRate[];
  rateHistory: MetalRate[];
  loading: boolean;
  error: string | null;
  
  // Rate getter
  getRate: (metal: MetalType, purity: MetalPurity) => number;
  getRateRecord: (metal: MetalType, purity: MetalPurity) => MetalRate | undefined;
  
  // Rate actions
  publishNewRate: (metal: MetalType, purity: MetalPurity, newRatePerGram: number, notes?: string, adminName?: string) => void;
  publishBatchRates: (
    items: Array<{ metal: MetalType; purity: MetalPurity; ratePerGram: number; notes?: string }>,
    adminName?: string
  ) => Promise<void>;
  rollbackRate: (rateId: string) => void;
  calculateRateImpact: (metal: MetalType, purity: MetalPurity, proposedRate: number, products: any[]) => RateImpactSummary;
  hydrateMetalRates: () => Promise<void>;
}

export const useMetalRateStore = create<MetalRateState>((set, get) => ({
  rates: loadRatesFromStorage(),
  rateHistory: loadRatesFromStorage(),
  loading: false,
  error: null,

  hydrateMetalRates: async () => {
    set({ loading: true, error: null });
    try {
      const allRates = await metalRateApi.listRates();
      // Deduplicate to newest active published rate per (metal, purity)
      const latestMap = new Map<string, MetalRate>();
      for (const r of allRates) {
        if (r.status === 'PUBLISHED') {
          const key = `${r.metal}_${r.purity}`;
          if (!latestMap.has(key)) {
            latestMap.set(key, r);
          }
        }
      }

      // If any of the standard rates were rolled back or missing, fall back to newest historical record
      const standardPairs: Array<{ metal: MetalType; purity: MetalPurity }> = [
        { metal: 'GOLD', purity: '24K' },
        { metal: 'GOLD', purity: '22K' },
        { metal: 'GOLD', purity: '18K' },
        { metal: 'GOLD', purity: '14K' },
        { metal: 'SILVER', purity: '999' },
        { metal: 'SILVER', purity: '925' },
        { metal: 'PLATINUM', purity: '950' },
      ];

      for (const pair of standardPairs) {
        const key = `${pair.metal}_${pair.purity}`;
        if (!latestMap.has(key)) {
          const newest = allRates.find((r) => r.metal === pair.metal && r.purity === pair.purity);
          if (newest) {
            latestMap.set(key, { ...newest, status: 'PUBLISHED' });
          }
        }
      }

      const activeRates = Array.from(latestMap.values());
      if (activeRates.length > 0) {
        saveRatesToStorage(activeRates);
        set({ rates: activeRates, rateHistory: allRates, loading: false });
      } else {
        set({ rateHistory: allRates, loading: false });
      }
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Unable to load metal rates from API' });
    }
  },

  getRate: (metal, purity) => {
    // 1. Try to find published rate in active rates
    const record = get().rates.find((r) => r.metal === metal && r.purity === purity && r.status === 'PUBLISHED');
    if (record) return record.ratePerGram;

    // 2. Try any record in active rates
    const anyRecord = get().rates.find((r) => r.metal === metal && r.purity === purity);
    if (anyRecord && anyRecord.ratePerGram > 0) return anyRecord.ratePerGram;

    // 3. Try to find in history
    const historyRecord = get().rateHistory.find((r) => r.metal === metal && r.purity === purity);
    if (historyRecord && historyRecord.ratePerGram > 0) return historyRecord.ratePerGram;
    
    // 4. Fallback defaults if not found
    const key = getRateKey(metal, purity);
    const defaults: Record<string, number> = {
      'GOLD_24K': 7450,
      'GOLD_22K': 6830,
      'GOLD_18K': 5590,
      'GOLD_14K': 4340,
      'SILVER_999': 89,
      'SILVER_925': 82,
      'PLATINUM_950': 3450,
    };
    return defaults[key] || 5000;
  },

  getRateRecord: (metal, purity) => {
    return get().rates.find((r) => r.metal === metal && r.purity === purity && r.status === 'PUBLISHED');
  },

  publishNewRate: (metal, purity, newRatePerGram, notes = '', adminName = 'Admin Owner') => {
    const currentList = get().rates;
    const existingIndex = currentList.findIndex((r) => r.metal === metal && r.purity === purity);
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    let oldRateVal = 0;
    if (existingIndex >= 0) {
      oldRateVal = currentList[existingIndex].ratePerGram;
    }

    const newRecord: MetalRate = {
      id: `mr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      metal,
      purity,
      ratePerGram: newRatePerGram,
      previousRate: oldRateVal,
      effectiveDate: dateStr,
      effectiveTime: timeStr,
      rateSource: 'Admin Manual Override / MCX Feed',
      notes,
      updatedBy: adminName,
      status: 'PUBLISHED',
      updatedAt: now.toISOString(),
    };

    let updatedRates = [...currentList];
    if (existingIndex >= 0) {
      updatedRates[existingIndex] = newRecord;
    } else {
      updatedRates.push(newRecord);
    }

    saveRatesToStorage(updatedRates);
    set({
      rates: updatedRates,
      rateHistory: [newRecord, ...get().rateHistory],
    });

    void metalRateApi
      .publishRate({ metal, purity, ratePerGram: newRatePerGram, notes, updatedBy: adminName })
      .catch((error) => {
        set({ error: error instanceof Error ? error.message : 'Unable to publish metal rate' });
      });
  },

  publishBatchRates: async (items, adminName = 'Admin Owner') => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const currentRates = [...get().rates];
    const newRecords: MetalRate[] = [];

    const updatedRates = currentRates.map((existing) => {
      const match = items.find((it) => it.metal === existing.metal && it.purity === existing.purity);
      if (match) {
        const record: MetalRate = {
          ...existing,
          id: `mr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ratePerGram: match.ratePerGram,
          previousRate: existing.ratePerGram,
          effectiveDate: dateStr,
          effectiveTime: timeStr,
          notes: match.notes || 'Bulk Shift Adjustment',
          updatedBy: adminName,
          status: 'PUBLISHED',
          updatedAt: now.toISOString(),
        };
        newRecords.push(record);
        return record;
      }
      return existing;
    });

    items.forEach((it) => {
      if (!updatedRates.some((r) => r.metal === it.metal && r.purity === it.purity)) {
        const record: MetalRate = {
          id: `mr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          metal: it.metal,
          purity: it.purity,
          ratePerGram: it.ratePerGram,
          previousRate: it.ratePerGram,
          effectiveDate: dateStr,
          effectiveTime: timeStr,
          rateSource: 'Admin Bulk Shift / MCX Feed',
          notes: it.notes || 'Bulk Shift Adjustment',
          updatedBy: adminName,
          status: 'PUBLISHED',
          updatedAt: now.toISOString(),
        };
        updatedRates.push(record);
        newRecords.push(record);
      }
    });

    saveRatesToStorage(updatedRates);
    set({
      rates: updatedRates,
      rateHistory: [...newRecords, ...get().rateHistory],
      error: null,
    });

    try {
      const savedFromApi = await metalRateApi.publishBatchRates(
        items.map((it) => ({
          metal: it.metal,
          purity: it.purity,
          ratePerGram: it.ratePerGram,
          notes: it.notes,
          updatedBy: adminName,
        }))
      );
      if (Array.isArray(savedFromApi) && savedFromApi.length > 0) {
        const merged = get().rates.map((r) => {
          const fromApi = savedFromApi.find((a) => a.metal === r.metal && a.purity === r.purity);
          return fromApi || r;
        });
        saveRatesToStorage(merged);
        set({ rates: merged });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to publish bulk metal rates to server' });
    }
  },

  rollbackRate: (rateId) => {
    const target = get().rateHistory.find((r) => r.id === rateId);
    if (!target) return;

    set((state) => ({
      rates: state.rates.map((r) =>
        r.metal === target.metal && r.purity === target.purity
          ? { ...r, ratePerGram: target.previousRate, previousRate: r.ratePerGram, updatedAt: new Date().toISOString() }
          : r
      ),
    }));
    void metalRateApi.rollbackRate(rateId).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to rollback metal rate' });
    });
  },

  calculateRateImpact: (metal, purity, proposedRate, products) => {
    const currentRate = get().getRate(metal, purity);
    let affected = 0;
    let increasing = 0;
    let decreasing = 0;
    let fixedCount = 0;
    let totalDiff = 0;
    let largestInc = 0;
    let largestDec = 0;

    products.forEach((p) => {
      if (p.pricingMode === 'FIXED') {
        fixedCount++;
        return;
      }
      if (p.metalType === metal && p.metalPurity === purity) {
        affected++;
        const weight = p.netWeightGrams || 10;
        const currentMetalVal = weight * currentRate;
        const proposedMetalVal = weight * proposedRate;
        const diff = proposedMetalVal - currentMetalVal;
        totalDiff += Math.abs(diff);

        if (diff > 0) {
          increasing++;
          if (diff > largestInc) largestInc = diff;
        } else if (diff < 0) {
          decreasing++;
          if (Math.abs(diff) > largestDec) largestDec = Math.abs(diff);
        }
      }
    });

    return {
      affectedProductsCount: affected,
      increasingProductsCount: increasing,
      decreasingProductsCount: decreasing,
      averagePriceChange: affected > 0 ? Math.round(totalDiff / affected) : 0,
      largestPriceIncrease: Math.round(largestInc),
      largestPriceDecrease: Math.round(largestDec),
      excludedFixedPriceProducts: fixedCount,
    };
  },
}));
