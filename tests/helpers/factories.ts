import type { Address, Category, Collection, Coupon, Customer, Order, Product } from '../../src/types';
import { INITIAL_PRODUCTS } from '../../src/data/mockProducts';

export const uniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const productFactory = (overrides: Partial<Product> = {}): Product => {
  const base = INITIAL_PRODUCTS[0];
  const id = overrides.id || uniqueId('jest-prod');
  return {
    ...base,
    ...overrides,
    id,
    name: overrides.name || `Jest Test Diamond ${id}`,
    slug: overrides.slug || `jest-test-diamond-${id}`,
    sku: overrides.sku || `JEST-SKU-${id}`,
    variants: overrides.variants || [],
    images: overrides.images || base.images.slice(0, 1),
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: overrides.updatedAt || new Date().toISOString(),
  };
};

export const categoryFactory = (overrides: Partial<Category> = {}): Category => ({
  id: overrides.id || uniqueId('jest-cat'),
  name: overrides.name || 'Jest Gemstones',
  slug: overrides.slug || uniqueId('jest-gemstones'),
  description: overrides.description || 'Test category',
  image: overrides.image || 'https://example.com/category.jpg',
  subcategories: overrides.subcategories || ['Diamonds'],
  featured: overrides.featured ?? true,
  itemCount: overrides.itemCount ?? 1,
});

export const collectionFactory = (overrides: Partial<Collection> = {}): Collection => ({
  id: overrides.id || uniqueId('jest-col'),
  name: overrides.name || 'Jest Collection',
  slug: overrides.slug || uniqueId('jest-collection'),
  description: overrides.description || 'Test collection',
  bannerImage: overrides.bannerImage || 'https://example.com/banner.jpg',
  featured: overrides.featured ?? true,
});

export const couponFactory = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: overrides.id || uniqueId('jest-coupon'),
  code: overrides.code || `JEST${Math.floor(Math.random() * 100000)}`,
  description: overrides.description || 'Jest coupon',
  discountType: overrides.discountType || 'FIXED',
  discountValue: overrides.discountValue ?? 100,
  minOrderAmount: overrides.minOrderAmount ?? 1000,
  startDate: overrides.startDate || '2026-01-01',
  endDate: overrides.endDate || '2026-12-31',
  usageLimit: overrides.usageLimit ?? 10,
  usedCount: overrides.usedCount ?? 0,
  perCustomerLimit: overrides.perCustomerLimit ?? 1,
  active: overrides.active ?? true,
});

export const addressFactory = (overrides: Partial<Address> = {}): Address => ({
  id: overrides.id || uniqueId('addr'),
  fullName: overrides.fullName || 'Jest Customer',
  phone: overrides.phone || '+91 78991 25449',
  email: overrides.email || 'jest.customer@gurudimonds.in',
  street: overrides.street || 'No. 1108, 1st Cross',
  city: overrides.city || 'Mysuru',
  state: overrides.state || 'Karnataka',
  pincode: overrides.pincode || '570001',
  country: overrides.country || 'India',
  isDefault: overrides.isDefault ?? true,
  addressType: overrides.addressType || 'Home',
});

export const customerFactory = (overrides: Partial<Customer> = {}): Customer => ({
  id: overrides.id || uniqueId('cust'),
  name: overrides.name || 'Jest Customer',
  email: overrides.email || `${uniqueId('customer')}@gurudimonds.in`,
  phone: overrides.phone || '+91 78991 25449',
  addresses: overrides.addresses || [addressFactory()],
  totalOrders: overrides.totalOrders ?? 0,
  totalSpent: overrides.totalSpent ?? 0,
  averageOrderValue: overrides.averageOrderValue ?? 0,
  createdAt: overrides.createdAt || new Date().toISOString(),
  tags: overrides.tags || ['Jest'],
  marketingConsent: overrides.marketingConsent ?? true,
  status: overrides.status || 'ACTIVE',
});

export const orderFactory = (overrides: Partial<Order> = {}): Order => {
  const customer = overrides.customer || {
    id: uniqueId('cust'),
    name: 'Jest Customer',
    email: `${uniqueId('order-customer')}@gurudimonds.in`,
    phone: '+91 78991 25449',
  };
  const address = addressFactory({ fullName: customer.name, email: customer.email, phone: customer.phone });
  const now = new Date().toISOString();
  return {
    id: overrides.id || uniqueId('order'),
    orderNumber: overrides.orderNumber || `GD-JEST-${Date.now()}`,
    customer,
    shippingAddress: overrides.shippingAddress || address,
    billingAddress: overrides.billingAddress || address,
    items: overrides.items || [],
    subtotal: overrides.subtotal ?? 1000,
    discountAmount: overrides.discountAmount ?? 0,
    gstTotal: overrides.gstTotal ?? 30,
    shippingCharge: overrides.shippingCharge ?? 0,
    totalAmount: overrides.totalAmount ?? 1030,
    paymentMethod: overrides.paymentMethod || 'UPI',
    paymentStatus: overrides.paymentStatus || 'PAID',
    orderStatus: overrides.orderStatus || 'CONFIRMED',
    placedAt: overrides.placedAt || now,
    metalRateSnapshotAtPlacement: overrides.metalRateSnapshotAtPlacement || { GOLD_24K: 7450 },
    history: overrides.history || [{ status: 'CONFIRMED', timestamp: now, note: 'Jest order', updatedBy: 'Jest' }],
    gstInvoiceNumber: overrides.gstInvoiceNumber || `INV-JEST-${Date.now()}`,
  };
};
