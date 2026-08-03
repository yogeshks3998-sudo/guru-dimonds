import { AdminRole } from '../types';

export const roleCan = (role: AdminRole | undefined, ...allowed: AdminRole[]) => {
  if (!role) return false;
  if (role === 'SUPER_ADMIN' || role === 'OWNER') return true;
  return allowed.includes(role);
};

export const routePermissions: Record<string, AdminRole[]> = {
  '/admin': ['OWNER', 'STAFF', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CONTENT_MANAGER', 'FINANCE'],
  '/admin/metal-rates': ['OWNER', 'FINANCE'],
  '/admin/products': ['OWNER', 'PRODUCT_MANAGER'],
  '/admin/products/new': ['OWNER', 'PRODUCT_MANAGER'],
  '/admin/orders': ['OWNER', 'ORDER_MANAGER', 'FINANCE'],
  '/admin/customers': ['OWNER', 'ORDER_MANAGER'],
  '/admin/cms': ['OWNER', 'CONTENT_MANAGER'],
};

