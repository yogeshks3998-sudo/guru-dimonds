import React, { useState, useEffect } from 'react';
import { getCurrentPath } from './utils/navigation';
import { RateTicker } from './components/layout/RateTicker';
import { StorefrontHeader } from './components/layout/StorefrontHeader';
import { StorefrontFooter } from './components/layout/StorefrontFooter';
import { CartDrawer } from './components/storefront/CartDrawer';
import { ToastProvider } from './components/ui/Toast';
import { useCartStore } from './stores/useCartStore';
import { useCMSStore } from './stores/useCMSStore';
import { useMetalRateStore } from './stores/useMetalRateStore';
import { useOrderStore } from './stores/useOrderStore';
import { useProductStore } from './stores/useProductStore';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { WishlistPage } from './pages/WishlistPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import {
  AboutPage,
  ContactPage,
  SizeGuidePage,
  PolicyPage,
} from './pages/StaticContentPages';

// Admin CMS Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMetalRatesPage } from './pages/admin/AdminMetalRatesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCMSPage } from './pages/admin/AdminCMSPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';

export function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getCurrentPath());
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    void useProductStore.getState().hydrateProducts();
    void useMetalRateStore.getState().hydrateMetalRates();
    void useCMSStore.getState().hydrateCMS();
    void useOrderStore.getState().hydrateOrders();
    void useCartStore.getState().hydrateCoupons();
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  const renderContent = () => {
    // Admin Routes
    if (currentPath === '/admin/login') return <AdminLoginPage />;
    if (currentPath === '/admin') return <AdminDashboardPage />;
    if (currentPath === '/admin/metal-rates') return <AdminMetalRatesPage />;
    if (currentPath === '/admin/products') return <AdminProductsPage />;
    if (currentPath === '/admin/products/new') return <AdminProductFormPage />;
    if (currentPath.startsWith('/admin/products/edit/')) {
      const id = currentPath.replace('/admin/products/edit/', '');
      return <AdminProductFormPage productId={id} />;
    }
    if (currentPath === '/admin/orders') return <AdminOrdersPage />;
    if (currentPath === '/admin/cms') return <AdminCMSPage />;
    if (currentPath === '/admin/customers') return <AdminCustomersPage />;

    // Storefront Routes
    if (currentPath === '/' || currentPath === '') return <HomePage />;
    if (currentPath === '/shop') return <ShopPage />;
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      return <ProductDetailPage slug={slug} />;
    }
    if (currentPath === '/checkout') return <CheckoutPage />;
    if (currentPath.startsWith('/checkout/success')) return <OrderConfirmationPage />;
    if (currentPath === '/wishlist') return <WishlistPage />;
    if (currentPath === '/account') return <CustomerAccountPage />;
    if (currentPath === '/track-order') return <TrackOrderPage />;
    if (currentPath === '/login') return <CustomerLoginPage />;

    // Static Pages
    if (currentPath === '/about') return <AboutPage />;
    if (currentPath === '/contact') return <ContactPage />;
    if (currentPath === '/size-guide') return <SizeGuidePage />;
    if (currentPath === '/privacy-policy')
      return (
        <PolicyPage
          title="Privacy Policy"
          content="Vedaara Fine Jewellery values your privacy. All payment tokens, delivery addresses, and personal contact info are encrypted using 256-bit SSL technology."
        />
      );
    if (currentPath === '/terms')
      return (
        <PolicyPage
          title="Terms & Conditions"
          content="All gold, silver, and gemstone products sold on Vedaara Fine Jewellery are 100% genuine and accompanied by official BIS Hallmarking or SGL/IGI certificates. Daily metal pricing is synchronized with live spot market rates."
        />
      );

    // Default Fallback
    return <HomePage />;
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAF8F3] text-[#1B1A18] font-sans antialiased flex flex-col justify-between selection:bg-[#A67C32] selection:text-white">
        <div>
          {!isAdminRoute && (
            <>
              <RateTicker />
              <StorefrontHeader onOpenCartDrawer={() => setCartDrawerOpen(true)} />
            </>
          )}

          <main>{renderContent()}</main>
        </div>

        {!isAdminRoute && (
          <>
            <StorefrontFooter />
            <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
          </>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
