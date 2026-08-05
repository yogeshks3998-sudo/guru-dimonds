import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HomePage } from '../../src/pages/HomePage';
import { ShopPage } from '../../src/pages/ShopPage';
import { ProductDetailPage } from '../../src/pages/ProductDetailPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { WishlistPage } from '../../src/pages/WishlistPage';
import { TrackOrderPage } from '../../src/pages/TrackOrderPage';
import { AdminDashboardPage } from '../../src/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '../../src/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '../../src/pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from '../../src/pages/admin/AdminCustomersPage';
import { AdminCMSPage } from '../../src/pages/admin/AdminCMSPage';
import { AdminMetalRatesPage } from '../../src/pages/admin/AdminMetalRatesPage';
import { ContactPage } from '../../src/pages/StaticContentPages';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useProductStore } from '../../src/stores/useProductStore';
import { INITIAL_PRODUCTS } from '../../src/data/mockProducts';

describe('Frontend page rendering', () => {
  beforeEach(() => {
    useAuthStore.setState({
      adminUser: {
        id: 'admin',
        name: 'Jest Owner',
        email: 'Admin@gmail.com',
        role: 'OWNER',
        active: true,
        lastLogin: new Date().toISOString(),
      },
      isAdminLoggedIn: true,
    });
  });

  it('Home Page renders Guru Diamonds hero', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('Home Page renders signature bestsellers when products do not have bestseller badges', () => {
    const productsWithoutBestsellerBadges = INITIAL_PRODUCTS.slice(0, 4).map((product) => ({
      ...product,
      badges: product.badges.filter((badge) => badge !== 'BEST_SELLER'),
    }));
    useProductStore.setState({ products: productsWithoutBestsellerBadges });

    renderWithProviders(<HomePage />);

    expect(screen.getByRole('heading', { name: /Signature Bestsellers/i })).toBeInTheDocument();
    expect(screen.getAllByText(productsWithoutBestsellerBadges[0].name).length).toBeGreaterThan(0);
  });

  it('Shop Page renders catalogue controls', () => {
    renderWithProviders(<ShopPage />);

    expect(screen.getByRole('heading', { name: /Gemstones & Jewellery Catalogue/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search gold rings/i)).toBeInTheDocument();
  });

  it('Product Detail renders a selected product', () => {
    renderWithProviders(<ProductDetailPage slug={INITIAL_PRODUCTS[0].slug} />);

    expect(screen.getByRole('heading', { name: INITIAL_PRODUCTS[0].name })).toBeInTheDocument();
  });

  it('Cart/Checkout renders empty state when cart is empty', () => {
    renderWithProviders(<CheckoutPage />);

    expect(screen.getByText(/Your Shopping Bag is Empty/i)).toBeInTheDocument();
  });

  it('Wishlist renders saved creations', () => {
    renderWithProviders(<WishlistPage />);

    expect(screen.getByText(/Saved Creations/i)).toBeInTheDocument();
  });

  it('Order Tracking renders tracking form', () => {
    renderWithProviders(<TrackOrderPage />);

    expect(screen.getByRole('heading', { name: /Track Your Shipment/i })).toBeInTheDocument();
  });

  it('Contact page renders final footer/contact identity', () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByText('info@gurudimonds.in')).toBeInTheDocument();
    expect(screen.getByText(/Kurubageri, Lashkar Mohalla/i)).toBeInTheDocument();
  });

  it('Admin Dashboard renders KPI dashboard', () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { name: /Executive Dashboard/i })).toBeInTheDocument();
  });

  it('Products Table renders product catalogue admin page', () => {
    renderWithProviders(<AdminProductsPage />);

    expect(screen.getByRole('heading', { name: /Jewellery Product Catalog/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Catalog Items/i)).toBeInTheDocument();
  });

  it('Orders Table renders order fulfillment page', () => {
    renderWithProviders(<AdminOrdersPage />);

    expect(screen.getByRole('heading', { name: /Customer Order Fulfillment/i })).toBeInTheDocument();
  });

  it('Customers Table renders customer directory page', () => {
    renderWithProviders(<AdminCustomersPage />);

    expect(screen.getByRole('heading', { name: /VIP Patrons & Client Directory/i })).toBeInTheDocument();
  });

  it('CMS renders CMS editor', () => {
    renderWithProviders(<AdminCMSPage />);

    expect(screen.getByRole('heading', { name: /Storefront Content Management/i })).toBeInTheDocument();
  });

  it('Metal Rates renders rate manager', () => {
    renderWithProviders(<AdminMetalRatesPage />);

    expect(screen.getByRole('heading', { name: /Live Metal Rates/i })).toBeInTheDocument();
  });
});
