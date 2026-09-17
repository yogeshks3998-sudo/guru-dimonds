import { MetalPurity, MetalRate, MetalType } from '../types';
import { apiRequest, jsonRequest } from './api';

export const metalRateApi = {
  listRates: () => apiRequest<MetalRate[]>('/metal-rates'),
  publishRate: (params: {
    metal: MetalType;
    purity: MetalPurity;
    ratePerGram: number;
    notes?: string;
    updatedBy?: string;
  }) => jsonRequest<MetalRate>('/metal-rates', 'POST', params),
  publishBatchRates: (items: Array<{
    metal: MetalType;
    purity: MetalPurity;
    ratePerGram: number;
    notes?: string;
    updatedBy?: string;
  }>) => jsonRequest<MetalRate[]>('/metal-rates/bulk', 'POST', { items }),
  rollbackRate: (id: string) => jsonRequest<MetalRate>(`/metal-rates/${encodeURIComponent(id)}/rollback`, 'POST', {}),
};


