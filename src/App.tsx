import React, { Suspense, lazy, useState, useEffect } from 'react';
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
import { useAuthStore } from './stores/useAuthStore';
import { useWishlistStore } from './stores/useWishlistStore';
import { roleCan, routePermissions } from './utils/permissions';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then((module) => ({ default: module.ShopPage })));
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage }))
);
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then((module) => ({ default: module.OrderConfirmationPage }))
);
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((module) => ({ default: module.WishlistPage })));
const CustomerAccountPage = lazy(() =>
  import('./pages/CustomerAccountPage').then((module) => ({ default: module.CustomerAccountPage }))
);
const TrackOrderPage = lazy(() =>
  import('./pages/TrackOrderPage').then((module) => ({ default: module.TrackOrderPage }))
);
const CustomerLoginPage = lazy(() =>
  import('./pages/CustomerLoginPage').then((module) => ({ default: module.CustomerLoginPage }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage }))
);
const StaticContentPages = lazy(() => import('./pages/StaticContentPages'));
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage }))
);
const AdminMetalRatesPage = lazy(() =>
  import('./pages/admin/AdminMetalRatesPage').then((module) => ({ default: module.AdminMetalRatesPage }))
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((module) => ({ default: module.AdminProductsPage }))
);
const AdminProductFormPage = lazy(() =>
  import('./pages/admin/AdminProductFormPage').then((module) => ({ default: module.AdminProductFormPage }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((module) => ({ default: module.AdminOrdersPage }))
);
const AdminCMSPage = lazy(() => import('./pages/admin/AdminCMSPage').then((module) => ({ default: module.AdminCMSPage })));
const AdminCustomersPage = lazy(() =>
  import('./pages/admin/AdminCustomersPage').then((module) => ({ default: module.AdminCustomersPage }))
);

export function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const { isAdminLoggedIn, isCustomerLoggedIn, adminUser } = useAuthStore();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getCurrentPath());
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    void useAuthStore.getState().restoreSession();
    void useProductStore.getState().hydrateProducts();
    void useMetalRateStore.getState().hydrateMetalRates();
    void useCMSStore.getState().hydrateCMS();
    void useCartStore.getState().hydrateCoupons();
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      void useOrderStore.getState().hydrateOrders();
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (isCustomerLoggedIn) {
      void useCartStore.getState().mergeGuestCartToCustomer();
      void useWishlistStore.getState().mergeGuestWishlistToCustomer();
    }
  }, [isCustomerLoggedIn]);

  const isAdminRoute = currentPath.startsWith('/admin');

  const renderContent = () => {
    // Admin Routes
    if (currentPath === '/admin/login') return <AdminLoginPage />;
    if (isAdminRoute && !isAdminLoggedIn) return <AdminLoginPage />;
    const exactAdminPath = currentPath.startsWith('/admin/products/edit/') ? '/admin/products' : currentPath;
    const allowedRoles = routePermissions[exactAdminPath];
    if (isAdminRoute && allowedRoles && !roleCan(adminUser?.role, ...allowedRoles)) {
      return (
        <div className="min-h-screen bg-[#1B1A18] text-[#FAF8F3] flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-3">
            <h1 className="font-serif text-3xl font-bold">Access Restricted</h1>
            <p className="text-sm text-[#D8C29D]">Your admin role does not include permission for this section.</p>
          </div>
        </div>
      );
    }
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
    if (currentPath === '/account' && !isCustomerLoggedIn) return <CustomerLoginPage />;
    if (currentPath === '/account') return <CustomerAccountPage />;
    if (currentPath === '/track-order') return <TrackOrderPage />;
    if (currentPath === '/login') return <CustomerLoginPage />;

    // Static Pages
    if (currentPath === '/about') return <StaticContentPages page="about" />;
    if (currentPath === '/contact') return <StaticContentPages page="contact" />;
    if (currentPath === '/size-guide') return <StaticContentPages page="size-guide" />;
    if (currentPath === '/privacy-policy')
      return (
        <StaticContentPages
          page="privacy-policy"
          title="Privacy Policy"
          content="Guru Diamonds values your privacy. Payment tokens, delivery addresses, and personal contact information are handled with secure encryption and used only for order, support, and service purposes."
        />
      );
    if (currentPath === '/terms')
      return (
        <StaticContentPages
          page="terms"
          title="Terms & Conditions"
          content="All gemstones, precious stones, silver jewellery, and jewellery accessories sold by Guru Diamonds are selected with care and verified for authenticity, quality, and fair pricing."
        />
      );

    // Default Fallback
    return <HomePage />;
  };

  return (
    <ToastProvider>
      <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#FAF8F3] text-[#1B1A18] font-sans antialiased flex flex-col justify-between selection:bg-[#A67C32] selection:text-white">
        <div>
          {!isAdminRoute && (
            <>
              <RateTicker />
              <StorefrontHeader onOpenCartDrawer={() => setCartDrawerOpen(true)} />
            </>
          )}

          <main className="w-full max-w-full overflow-x-clip">
            <Suspense
              fallback={
                <div className="min-h-[40vh] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-[#A67C32]">
                  Loading Guru Diamonds...
                </div>
              }
            >
              {renderContent()}
            </Suspense>
          </main>
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
