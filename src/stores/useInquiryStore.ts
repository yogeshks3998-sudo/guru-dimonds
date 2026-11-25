import { create } from 'zustand';
import { inquiryApi, InquirySubmitPayload } from '../services/inquiryApi';

export interface ContactInquiry {
  id: string;
  name: string;
  contactNumber: string;
  gmail: string;
  requirement: string;
  message: string;
  createdAt: string;
  status: 'NEW' | 'RESPONDED' | 'ARCHIVED';
  adminNotes?: string;
  assignedTo?: string;
}

interface InquiryState {
  inquiries: ContactInquiry[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hydrateInquiries: (params?: { page?: number; limit?: number; status?: string; search?: string }) => Promise<void>;
  addInquiry: (inquiry: InquirySubmitPayload) => Promise<ContactInquiry>;
  updateInquiryStatus: (id: string, status: ContactInquiry['status'], notes?: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,

  hydrateInquiries: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await inquiryApi.getInquiries(params);
      set({
        inquiries: res.inquiries,
        total: res.pagination.total,
        page: res.pagination.page,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Unable to load inquiries',
      });
    }
  },

  addInquiry: async (data) => {
    const res = await inquiryApi.submitInquiry(data);
    const created = res.inquiry;
    set((state) => ({ inquiries: [created, ...state.inquiries], total: state.total + 1 }));
    return created;
  },

  updateInquiryStatus: async (id, status, notes) => {
    try {
      const updated = await inquiryApi.updateInquiryStatus(id, status, notes);
      set((state) => ({
        inquiries: state.inquiries.map((inq) => (inq.id === id ? updated : inq)),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update status' });
      throw err;
    }
  },

  deleteInquiry: async (id) => {
    try {
      await inquiryApi.deleteInquiry(id);
      set((state) => ({
        inquiries: state.inquiries.filter((inq) => inq.id !== id),
        total: Math.max(0, state.total - 1),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete inquiry' });
      throw err;
    }
  },
}));
