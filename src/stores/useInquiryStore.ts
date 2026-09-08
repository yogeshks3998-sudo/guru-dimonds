import { create } from 'zustand';

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
}

const STORAGE_KEY = 'guru_diamonds_contact_inquiries';

const INITIAL_INQUIRIES: ContactInquiry[] = [
  {
    id: 'INQ-1001',
    name: 'Yogesh K S',
    contactNumber: '+91 78991 25449',
    gmail: 'yogesh@gurudimonds.in',
    requirement: 'Bespoke Custom Order',
    message: 'Looking for a custom 925 Hallmarked silver pendant with natural emerald stone set in traditional antique carving.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'NEW',
  },
  {
    id: 'INQ-1002',
    name: 'Ananya Deshmukh',
    contactNumber: '+91 98201 45892',
    gmail: 'ananya.deshmukh@gmail.com',
    requirement: '1 to 24 Mukhi Rudrakshas',
    message: 'Need authentic Nepal 5-Mukhi and 14-Mukhi Rudraksha with X-Ray lab certification for personal wearing.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'RESPONDED',
    adminNotes: 'Contacted via WhatsApp. Sent lab certification samples.',
  },
  {
    id: 'INQ-1003',
    name: 'Rajesh Singhania',
    contactNumber: '+91 98112 30848',
    gmail: 'rajesh.singhania@gmail.com',
    requirement: 'God Small Statues',
    message: 'Inquiring about 500g pure 925 silver Lakshmi Ganesha idol set for Diwali gifting.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'RESPONDED',
  }
];

interface InquiryState {
  inquiries: ContactInquiry[];
  hydrateInquiries: () => void;
  addInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => ContactInquiry;
  updateInquiryStatus: (id: string, status: ContactInquiry['status'], notes?: string) => void;
  deleteInquiry: (id: string) => void;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_INQUIRIES;
  })(),

  hydrateInquiries: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ inquiries: JSON.parse(stored) });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INQUIRIES));
        set({ inquiries: INITIAL_INQUIRIES });
      }
    } catch {
      set({ inquiries: INITIAL_INQUIRIES });
    }
  },

  addInquiry: (data) => {
    const newInquiry: ContactInquiry = {
      ...data,
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'NEW',
    };

    const updated = [newInquiry, ...get().inquiries];
    set({ inquiries: updated });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newInquiry;
  },

  updateInquiryStatus: (id, status, notes) => {
    const updated = get().inquiries.map((inq) =>
      inq.id === id ? { ...inq, status, ...(notes !== undefined ? { adminNotes: notes } : {}) } : inq
    );
    set({ inquiries: updated });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  deleteInquiry: (id) => {
    const updated = get().inquiries.filter((inq) => inq.id !== id);
    set({ inquiries: updated });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },
}));
