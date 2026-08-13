import { create } from 'zustand';
import { AdminRole, AdminUser, Customer } from '../types';
import { AUTH_TOKEN_KEY, LEGACY_AUTH_TOKEN_KEY } from '../services/api';
import { authApi } from '../services/authApi';

interface AuthState {
  customer: Customer | null;
  isCustomerLoggedIn: boolean;
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;

  loginCustomer: (email: string, password: string) => Promise<boolean>;
  registerCustomer: (params: { name: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logoutCustomer: () => void;
  updateCustomerProfile: (updated: Partial<Customer>) => void;

  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  switchAdminRole: (role: AdminRole) => void;
  restoreSession: () => Promise<void>;
  hasRole: (...roles: AdminRole[]) => boolean;
}

const getSavedToken = () => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
    if (token && !localStorage.getItem(AUTH_TOKEN_KEY)) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return null;
  }
};

const saveToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
      localStorage.removeItem('guru_mock_user_v1');
    }
  } catch {
    // Ignore storage errors
  }
};

const saveMockUser = (user: { type: 'ADMIN'; adminUser: AdminUser } | { type: 'CUSTOMER'; customer: Customer }) => {
  try {
    localStorage.setItem('guru_mock_user_v1', JSON.stringify(user));
  } catch {
    // Ignore
  }
};

const getSavedMockUser = (): ({ type: 'ADMIN'; adminUser: AdminUser } | { type: 'CUSTOMER'; customer: Customer }) | null => {
  try {
    const raw = localStorage.getItem('guru_mock_user_v1');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const nowIso = new Date().toISOString();

const MOCK_ADMIN_ACCOUNTS: Record<string, AdminUser> = {
  'owner@gurudimonds.in': {
    id: 'adm-owner',
    name: 'Guru Diamonds Owner',
    email: 'owner@gurudimonds.in',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    active: true,
    lastLogin: nowIso,
  },
  'superadmin@gurudimonds.in': {
    id: 'adm-super',
    name: 'Guru Diamonds Super Admin',
    email: 'superadmin@gurudimonds.in',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    active: true,
    lastLogin: nowIso,
  },
  'product.manager@gurudimonds.in': {
    id: 'adm-product',
    name: 'Product Manager',
    email: 'product.manager@gurudimonds.in',
    role: 'PRODUCT_MANAGER',
    active: true,
    lastLogin: nowIso,
  },
  'inventory.manager@gurudimonds.in': {
    id: 'adm-inventory',
    name: 'Inventory Manager',
    email: 'inventory.manager@gurudimonds.in',
    role: 'INVENTORY_MANAGER',
    active: true,
    lastLogin: nowIso,
  },
  'order.manager@gurudimonds.in': {
    id: 'adm-order',
    name: 'Order Manager',
    email: 'order.manager@gurudimonds.in',
    role: 'ORDER_MANAGER',
    active: true,
    lastLogin: nowIso,
  },
  'content.manager@gurudimonds.in': {
    id: 'adm-content',
    name: 'Content Manager',
    email: 'content.manager@gurudimonds.in',
    role: 'CONTENT_MANAGER',
    active: true,
    lastLogin: nowIso,
  },
  'finance.manager@gurudimonds.in': {
    id: 'adm-finance',
    name: 'Finance Manager',
    email: 'finance.manager@gurudimonds.in',
    role: 'FINANCE',
    active: true,
    lastLogin: nowIso,
  },
  'staff@gurudimonds.in': {
    id: 'adm-staff',
    name: 'Store Staff',
    email: 'staff@gurudimonds.in',
    role: 'STAFF',
    active: true,
    lastLogin: nowIso,
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: null,
  isCustomerLoggedIn: false,
  adminUser: null,
  isAdminLoggedIn: false,
  token: getSavedToken(),
  loading: false,
  error: null,

  loginCustomer: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, customer } = await authApi.loginCustomer(email, password);
      saveToken(token);
      saveMockUser({ type: 'CUSTOMER', customer });
      set({
        token,
        customer,
        isCustomerLoggedIn: true,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return true;
    } catch {
      // Fallback mode for standalone/offline frontend
      const mockCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        phone: '+91 98765 43210',
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        createdAt: new Date().toISOString(),
        tags: ['New Customer'],
        marketingConsent: true,
        status: 'ACTIVE',
        addresses: [],
      };
      const mockToken = `mock-cust-token-${Date.now()}`;
      saveToken(mockToken);
      saveMockUser({ type: 'CUSTOMER', customer: mockCustomer });
      set({
        token: mockToken,
        customer: mockCustomer,
        isCustomerLoggedIn: true,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return true;
    }
  },

  registerCustomer: async (params) => {
    set({ loading: true, error: null });
    try {
      const { token, customer } = await authApi.registerCustomer(params);
      saveToken(token);
      saveMockUser({ type: 'CUSTOMER', customer });
      set({
        token,
        customer,
        isCustomerLoggedIn: true,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return true;
    } catch {
      // Fallback mode for standalone/offline frontend
      const mockCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: params.name,
        email: params.email,
        phone: params.phone || '+91 98765 43210',
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        createdAt: new Date().toISOString(),
        tags: ['Registered Patron'],
        marketingConsent: true,
        status: 'ACTIVE',
        addresses: [],
      };
      const mockToken = `mock-cust-token-${Date.now()}`;
      saveToken(mockToken);
      saveMockUser({ type: 'CUSTOMER', customer: mockCustomer });
      set({
        token: mockToken,
        customer: mockCustomer,
        isCustomerLoggedIn: true,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return true;
    }
  },

  logoutCustomer: () => {
    saveToken(null);
    void authApi.logout().catch(() => {});
    set({ token: null, customer: null, isCustomerLoggedIn: false });
  },

  updateCustomerProfile: (updated) => {
    set((state) => {
      const updatedCust = state.customer ? { ...state.customer, ...updated } : null;
      if (updatedCust) {
        saveMockUser({ type: 'CUSTOMER', customer: updatedCust });
      }
      return { customer: updatedCust };
    });
  },

  loginAdmin: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, adminUser } = await authApi.loginAdmin(email, password);
      saveToken(token);
      saveMockUser({ type: 'ADMIN', adminUser });
      set({
        token,
        adminUser,
        isAdminLoggedIn: true,
        customer: null,
        isCustomerLoggedIn: false,
        loading: false,
      });
      return true;
    } catch {
      // Fallback mode for standalone/offline frontend
      const normalizedEmail = email.trim().toLowerCase();
      const adminUser: AdminUser = MOCK_ADMIN_ACCOUNTS[normalizedEmail] || {
        id: `adm-${Date.now()}`,
        name: normalizedEmail.split('@')[0].replace('.', ' '),
        email: normalizedEmail,
        role: 'OWNER',
        active: true,
        lastLogin: new Date().toISOString(),
      };

      const mockToken = `mock-admin-token-${Date.now()}`;
      saveToken(mockToken);
      saveMockUser({ type: 'ADMIN', adminUser });
      set({
        token: mockToken,
        adminUser,
        isAdminLoggedIn: true,
        customer: null,
        isCustomerLoggedIn: false,
        loading: false,
      });
      return true;
    }
  },

  logoutAdmin: () => {
    saveToken(null);
    void authApi.logout().catch(() => {});
    set({ token: null, adminUser: null, isAdminLoggedIn: false });
  },

  switchAdminRole: (role) => {
    set((state) => {
      const updatedAdmin = state.adminUser ? { ...state.adminUser, role } : null;
      if (updatedAdmin) {
        saveMockUser({ type: 'ADMIN', adminUser: updatedAdmin });
      }
      return { adminUser: updatedAdmin };
    });
  },

  restoreSession: async () => {
    const token = getSavedToken();
    if (!token) return;
    set({ loading: true, error: null, token });
    try {
      const session = await authApi.me();
      if (session.type === 'ADMIN') {
        set({
          adminUser: session.adminUser,
          isAdminLoggedIn: true,
          customer: null,
          isCustomerLoggedIn: false,
          loading: false,
        });
      } else {
        set({
          customer: session.customer,
          isCustomerLoggedIn: true,
          adminUser: null,
          isAdminLoggedIn: false,
          loading: false,
        });
      }
    } catch {
      // Offline / standalone session recovery from localStorage
      const savedMock = getSavedMockUser();
      if (savedMock) {
        if (savedMock.type === 'ADMIN') {
          set({
            adminUser: savedMock.adminUser,
            isAdminLoggedIn: true,
            customer: null,
            isCustomerLoggedIn: false,
            loading: false,
          });
        } else {
          set({
            customer: savedMock.customer,
            isCustomerLoggedIn: true,
            adminUser: null,
            isAdminLoggedIn: false,
            loading: false,
          });
        }
      } else {
        saveToken(null);
        set({
          token: null,
          customer: null,
          isCustomerLoggedIn: false,
          adminUser: null,
          isAdminLoggedIn: false,
          loading: false,
        });
      }
    }
  },

  hasRole: (...roles) => {
    const role = get().adminUser?.role;
    return Boolean(role && (role === 'SUPER_ADMIN' || roles.includes(role)));
  },
}));
