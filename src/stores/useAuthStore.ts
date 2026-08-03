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
    }
  } catch {
    // Ignore storage errors so logout/login state still updates in memory.
  }
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
      set({
        token,
        customer,
        isCustomerLoggedIn: true,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return true;
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Customer login failed' });
      return false;
    }
  },

  registerCustomer: async (params) => {
    set({ loading: true, error: null });
    try {
      const { token, customer } = await authApi.registerCustomer(params);
      saveToken(token);
      set({
        token,
        customer,
        isCustomerLoggedIn: true,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return true;
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Customer registration failed' });
      return false;
    }
  },

  logoutCustomer: () => {
    saveToken(null);
    void authApi.logout().catch(() => {});
    set({ token: null, customer: null, isCustomerLoggedIn: false });
  },

  updateCustomerProfile: (updated) => {
    set((state) => ({
      customer: state.customer ? { ...state.customer, ...updated } : null,
    }));
  },

  loginAdmin: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, adminUser } = await authApi.loginAdmin(email, password);
      saveToken(token);
      set({
        token,
        adminUser,
        isAdminLoggedIn: true,
        customer: null,
        isCustomerLoggedIn: false,
        loading: false,
      });
      return true;
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Admin login failed' });
      return false;
    }
  },

  logoutAdmin: () => {
    saveToken(null);
    void authApi.logout().catch(() => {});
    set({ token: null, adminUser: null, isAdminLoggedIn: false });
  },

  switchAdminRole: (role) => {
    set((state) => ({
      adminUser: state.adminUser ? { ...state.adminUser, role } : null,
    }));
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
    } catch (error) {
      saveToken(null);
      set({
        token: null,
        customer: null,
        isCustomerLoggedIn: false,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Session expired',
      });
    }
  },

  hasRole: (...roles) => {
    const role = get().adminUser?.role;
    return Boolean(role && (role === 'SUPER_ADMIN' || roles.includes(role)));
  },
}));
