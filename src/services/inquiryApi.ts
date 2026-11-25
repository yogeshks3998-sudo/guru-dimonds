import { apiRequest, jsonRequest } from './api';
import type { ContactInquiry } from '../stores/useInquiryStore';

export interface InquirySubmitPayload {
  name: string;
  contactNumber: string;
  gmail: string;
  requirement: string;
  message: string;
}

export interface InquiryListResponse {
  inquiries: ContactInquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const inquiryApi = {
  submitInquiry: (data: InquirySubmitPayload) =>
    jsonRequest<{ success: boolean; message: string; inquiry: ContactInquiry }>('/inquiries', 'POST', data),

  getInquiries: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<InquiryListResponse>(`/inquiries${query}`);
  },

  updateInquiryStatus: (id: string, status: ContactInquiry['status'], adminNotes?: string) =>
    jsonRequest<ContactInquiry>(`/inquiries/${encodeURIComponent(id)}/status`, 'PATCH', { status, adminNotes }),

  deleteInquiry: (id: string) =>
    apiRequest<void>(`/inquiries/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

