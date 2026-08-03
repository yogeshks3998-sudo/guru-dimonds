import { create } from 'zustand';
import { Customer, AdminUser, AdminRole } from '../types';
import { INITIAL_CUSTOMERS } from '../data/mockData';

interface AuthState {
  // Customer Auth
  customer: Customer | null;
  isCustomerLoggedIn: boolean;
  
  // Admin Auth
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  
  // Actions
  loginCustomer: (email: string) => boolean;
  logoutCustomer: () => void;
  updateCustomerProfile: (updated: Partial<Customer>) => void;
  
  loginAdmin: (role?: AdminRole) => void;
  logoutAdmin: () => void;
  switchAdminRole: (role: AdminRole) => void;
}

const DEFAULT_ADMIN: AdminUser = {
  id: 'adm-1',
  name: 'Vikramaditya Sharma',
  email: 'owner@vedaara.com',
  role: 'OWNER',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  active: true,
  lastLogin: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  customer: INITIAL_CUSTOMERS[0], // Logged in as default VIP customer for easy preview
  isCustomerLoggedIn: true,
  
  adminUser: DEFAULT_ADMIN,
  isAdminLoggedIn: true, // Logged in as Admin by default for seamless CMS testing
  
  loginCustomer: (email) => {
    const found = INITIAL_CUSTOMERS.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (found) {
      set({ customer: found, isCustomerLoggedIn: true });
      return true;
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: email.split('@')[0],
        email,
        phone: '+91 98000 00000',
        addresses: [],
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        createdAt: new Date().toISOString(),
        tags: ['New Customer'],
        marketingConsent: true,
        status: 'ACTIVE',
      };
      set({ customer: newCust, isCustomerLoggedIn: true });
      return true;
    }
  },
  
  logoutCustomer: () => {
    set({ customer: null, isCustomerLoggedIn: false });
  },
  
  updateCustomerProfile: (updated) => {
    set((state) => ({
      customer: state.customer ? { ...state.customer, ...updated } : null,
    }));
  },
  
  loginAdmin: (role = 'OWNER') => {
    set({
      adminUser: { ...DEFAULT_ADMIN, role },
      isAdminLoggedIn: true,
    });
  },
  
  logoutAdmin: () => {
    set({ adminUser: null, isAdminLoggedIn: false });
  },
  
  switchAdminRole: (role) => {
    set((state) => ({
      adminUser: state.adminUser ? { ...state.adminUser, role } : { ...DEFAULT_ADMIN, role },
    }));
  },
}));
