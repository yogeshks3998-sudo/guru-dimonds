import { useAuthStore } from '../../src/stores/useAuthStore';
import { useCartStore } from '../../src/stores/useCartStore';
import { useCMSStore } from '../../src/stores/useCMSStore';
import { useMetalRateStore } from '../../src/stores/useMetalRateStore';
import { useOrderStore } from '../../src/stores/useOrderStore';
import { useProductStore } from '../../src/stores/useProductStore';
import { useWishlistStore } from '../../src/stores/useWishlistStore';
import { mockFetchJson, mockFetchReject } from '../helpers/mockFetch';
import { couponFactory, productFactory } from '../helpers/factories';
import { INITIAL_CMS, INITIAL_METAL_RATES } from '../../src/data/mockData';

describe('Zustand store tests', () => {
  it('Product Store handles loading and API success', async () => {
    const products = [productFactory({ id: 'api-prod' })];
    mockFetchJson(products);

    const promise = useProductStore.getState().hydrateProducts();
    expect(useProductStore.getState().loading).toBe(true);
    await promise;

    expect(useProductStore.getState().loading).toBe(false);
    expect(useProductStore.getState().products).toHaveLength(1);
  });

  it('Product Store handles API failure and fallback mode', async () => {
    mockFetchReject();

    await useProductStore.getState().hydrateProducts();

    expect(useProductStore.getState().error).toMatch(/Network timeout|Unable to load products/i);
    expect(useProductStore.getState().products.length).toBeGreaterThan(0);
  });

  it('Product Store filters can reset', () => {
    useProductStore.getState().setSearchQuery('ruby');
    useProductStore.getState().setSelectedCategory('Gemstones');
    useProductStore.getState().resetFilters();

    expect(useProductStore.getState().searchQuery).toBe('');
    expect(useProductStore.getState().selectedCategory).toBeNull();
  });

  it('Cart Store adds, updates, and clears items', () => {
    const product = productFactory({ id: 'cart-prod' });
    useCartStore.setState({ items: [], appliedCoupon: null });

    useCartStore.getState().addItem({ product, quantity: 1 });
    const item = useCartStore.getState().items[0];
    useCartStore.getState().updateQuantity(item.id, 3);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
    expect(useCartStore.getState().getSubtotal()).toBeGreaterThan(0);

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('Cart Store validates coupon success and failure', () => {
    const coupon = couponFactory({ code: 'JESTCART', minOrderAmount: 1 });
    useCartStore.setState({ coupons: [coupon], appliedCoupon: null, items: [] });
    useCartStore.getState().addItem({ product: productFactory(), quantity: 1 });

    expect(useCartStore.getState().applyCoupon('JESTCART').success).toBe(true);
    expect(useCartStore.getState().applyCoupon('NOPE').success).toBe(false);
  });

  it('Wishlist Store toggles and clears wishlist ids', () => {
    useWishlistStore.setState({ wishlistIds: [] });

    useWishlistStore.getState().toggleWishlist('prod-1');
    expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true);

    useWishlistStore.getState().clearWishlist();
    expect(useWishlistStore.getState().wishlistIds).toEqual([]);
  });

  it('CMS Store hydrates success and preserves brand footer', async () => {
    mockFetchJson({ ...INITIAL_CMS, footer: { ...INITIAL_CMS.footer, email: 'old@example.com' } });

    await useCMSStore.getState().hydrateCMS();

    expect(useCMSStore.getState().cms.footer.email).toBe('infi@gurudimonds.in');
  });

  it('CMS Store handles API failure', async () => {
    mockFetchReject();

    await useCMSStore.getState().hydrateCMS();

    expect(useCMSStore.getState().error).toMatch(/Network timeout|Unable to load CMS/i);
  });

  it('CMS Store updates footer while preserving locked brand contact', () => {
    useCMSStore.getState().updateFooter({ email: 'wrong@example.com', aboutText: 'Updated text' });

    expect(useCMSStore.getState().cms.footer.aboutText).toBe('Updated text');
    expect(useCMSStore.getState().cms.footer.email).toBe('infi@gurudimonds.in');
  });

  it('Metal Rate Store hydrates success', async () => {
    mockFetchJson(INITIAL_METAL_RATES);

    await useMetalRateStore.getState().hydrateMetalRates();

    expect(useMetalRateStore.getState().rates.length).toBeGreaterThan(0);
  });

  it('Metal Rate Store handles failure and keeps fallback rates', async () => {
    mockFetchReject();

    await useMetalRateStore.getState().hydrateMetalRates();

    expect(useMetalRateStore.getState().error).toMatch(/Network timeout|Unable to load metal rates/i);
    expect(useMetalRateStore.getState().getRate('GOLD', '22K')).toBeGreaterThan(0);
  });

  it('Order Store places and updates fallback orders', () => {
    const order = useOrderStore.getState().placeOrder({
      customer: { id: 'cust-store', name: 'Store Customer', email: 'store@gurudimonds.in', phone: '+91 78991 25449' },
      shippingAddress: {
        id: 'addr-store',
        fullName: 'Store Customer',
        phone: '+91 78991 25449',
        email: 'store@gurudimonds.in',
        street: '1st Cross',
        city: 'Mysuru',
        state: 'Karnataka',
        pincode: '570001',
        country: 'India',
        isDefault: true,
        addressType: 'Home',
      },
      billingAddress: {
        id: 'addr-store',
        fullName: 'Store Customer',
        phone: '+91 78991 25449',
        email: 'store@gurudimonds.in',
        street: '1st Cross',
        city: 'Mysuru',
        state: 'Karnataka',
        pincode: '570001',
        country: 'India',
        isDefault: true,
        addressType: 'Home',
      },
      items: [],
      subtotal: 1000,
      discountAmount: 0,
      gstTotal: 30,
      shippingCharge: 0,
      totalAmount: 1030,
      paymentMethod: 'UPI',
    });

    useOrderStore.getState().updateOrderStatus(order.id, 'PROCESSING', 'Processing');
    expect(useOrderStore.getState().orders.find((item) => item.id === order.id)?.orderStatus).toBe('PROCESSING');
  });

  it('Authentication Store handles admin login success and logout', async () => {
    mockFetchJson({
      token: 'jwt-token',
      adminUser: { id: 'admin', name: 'Admin', email: 'Admin@gmail.com', role: 'OWNER', active: true },
    });

    await expect(useAuthStore.getState().loginAdmin('Admin@gmail.com', 'Admin@123')).resolves.toBe(true);
    expect(useAuthStore.getState().isAdminLoggedIn).toBe(true);

    useAuthStore.getState().logoutAdmin();
    expect(useAuthStore.getState().isAdminLoggedIn).toBe(false);
  });

  it('Authentication Store handles API failure', async () => {
    mockFetchReject();

    await expect(useAuthStore.getState().loginAdmin('Admin@gmail.com', 'bad')).resolves.toBe(false);
    expect(useAuthStore.getState().error).toMatch(/Network timeout|Admin login failed/i);
  });
});
