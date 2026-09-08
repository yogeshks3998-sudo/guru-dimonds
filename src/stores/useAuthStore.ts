import { create } from 'zustand';
import { AdminRole, AdminUser, Customer } from '../types';
import { AUTH_TOKEN_KEY, LEGACY_AUTH_TOKEN_KEY, clearStoredAuth } from '../services/api';
import { authApi } from '../services/authApi';

interface AuthState {
  customer: Customer | null;
  isCustomerLoggedIn: boolean;
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;

  loginCustomer: (identifier: string, password: string) => Promise<boolean>;
  registerCustomer: (params: { name: string; phone: string; email?: string; password: string; confirmPassword?: string }) => Promise<{
    success: boolean;
    message?: string;
  }>;
  verifyCustomerOtp: (identifier: { email?: string; phone?: string } | string, otp?: string) => Promise<boolean>;
  resendCustomerOtp: (identifier: { email?: string; phone?: string } | string) => Promise<{ success: boolean; message: string }>;
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

export const isMockAuthToken = (token: string | null) =>
  Boolean(token?.startsWith('mock-cust-token-') || token?.startsWith('mock-admin-token-'));

export const hasCustomerApiSession = () => {
  const state = useAuthStore.getState();
  return state.isCustomerLoggedIn && Boolean(state.token) && !isMockAuthToken(state.token);
};

const saveToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else clearStoredAuth();
  } catch {
    // Ignore storage errors
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

  loginCustomer: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const { token, customer } = await authApi.loginCustomer(identifier, password);
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
      saveToken(null);
      set({
        token: null,
        customer: null,
        isCustomerLoggedIn: false,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Customer login failed',
      });
      return false;
    }
  },

  registerCustomer: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.registerCustomer(params);
      if (!('token' in response)) {
        throw new Error('Registration response was incomplete');
      }
      saveToken(response.token);
      set({
        token: response.token,
        customer: response.customer,
        isCustomerLoggedIn: true,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return { success: true, message: response.message };
    } catch (error) {
      saveToken(null);
      set({
        token: null,
        customer: null,
        isCustomerLoggedIn: false,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Customer registration failed',
      });
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed' };
    }
  },

  verifyCustomerOtp: async (identifier, otp) => {
    set({ loading: true, error: null });
    try {
      const payload = typeof identifier === 'string' ? { phone: identifier, otp: otp || '' } : { ...identifier, otp: otp || (identifier as any).otp || '' };
      const { token, customer } = await authApi.verifyCustomerOtp(payload);
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
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      });
      return false;
    }
  },

  resendCustomerOtp: async (identifier) => {
    set({ loading: true, error: null });
    try {
      const payload = typeof identifier === 'string' ? { phone: identifier } : identifier;
      const response = await authApi.resendCustomerOtp(payload);
      set({ loading: false });
      return { success: true, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to resend verification code';
      set({ loading: false, error: message });
      return { success: false, message };
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
      return { customer: updatedCust };
    });
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
      saveToken(null);
      set({
        token: null,
        adminUser: null,
        isAdminLoggedIn: false,
        customer: null,
        isCustomerLoggedIn: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Admin login failed',
      });
      return false;
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
      return { adminUser: updatedAdmin };
    });
  },

  restoreSession: async () => {
    const token = getSavedToken();
    if (!token) return;
    set({ loading: true, error: null, token });
    if (isMockAuthToken(token)) {
      saveToken(null);
      set({
        token: null,
        customer: null,
        isCustomerLoggedIn: false,
        adminUser: null,
        isAdminLoggedIn: false,
        loading: false,
      });
      return;
    }
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
  },

  hasRole: (...roles) => {
    const role = get().adminUser?.role;
    return Boolean(role && (role === 'SUPER_ADMIN' || roles.includes(role)));
  },
}));
