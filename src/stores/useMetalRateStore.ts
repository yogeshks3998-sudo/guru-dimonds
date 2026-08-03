import { create } from 'zustand';
import { MetalRate, MetalType, MetalPurity } from '../types';
import { INITIAL_METAL_RATES } from '../data/mockData';
import { getRateKey } from '../utils/pricing';

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
  
  // Rate getter
  getRate: (metal: MetalType, purity: MetalPurity) => number;
  getRateRecord: (metal: MetalType, purity: MetalPurity) => MetalRate | undefined;
  
  // Rate actions
  publishNewRate: (metal: MetalType, purity: MetalPurity, newRatePerGram: number, notes?: string, adminName?: string) => void;
  rollbackRate: (rateId: string) => void;
  calculateRateImpact: (metal: MetalType, purity: MetalPurity, proposedRate: number, products: any[]) => RateImpactSummary;
}

export const useMetalRateStore = create<MetalRateState>((set, get) => ({
  rates: INITIAL_METAL_RATES,
  rateHistory: INITIAL_METAL_RATES,

  getRate: (metal, purity) => {
    const record = get().rates.find((r) => r.metal === metal && r.purity === purity && r.status === 'PUBLISHED');
    if (record) return record.ratePerGram;
    
    // Fallback defaults if not found
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
      id: `mr-${Date.now()}`,
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

    set({
      rates: updatedRates,
      rateHistory: [newRecord, ...get().rateHistory],
    });
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
