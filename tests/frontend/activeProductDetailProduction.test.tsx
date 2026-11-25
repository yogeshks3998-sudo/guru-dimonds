import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { ProductDetailPage } from '../../src/pages/ProductDetailPage';
import { INITIAL_PRODUCTS } from '../../src/data/mockProducts';
import { ENQUIRY_PRODUCTS } from '../../src/data/enquiryProducts';
import { useProductStore } from '../../src/stores/useProductStore';
import { useCartStore } from '../../src/stores/useCartStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { ToastProvider } from '../../src/components/ui/Toast';

const renderWithToast = (ui: React.ReactElement) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('Production Product Detail Page UI for Active & Enquiry Products', () => {
  beforeEach(() => {
    useProductStore.setState({ products: [...INITIAL_PRODUCTS, ...ENQUIRY_PRODUCTS] });
    useCartStore.setState({ items: [] });
    useAuthStore.setState({ isAdminLoggedIn: false, adminUser: null });
  });

  test('Natural Gomedhika Silver Ring renders full production pricing, specs, and sizing', () => {
    const ring = INITIAL_PRODUCTS.find((p) => p.name.includes('Gomedhika'))!;
    renderWithToast(<ProductDetailPage slug={ring.slug} />);

    // 1. Heading
    expect(screen.getByRole('heading', { name: ring.name })).toBeInTheDocument();

    // 2. Draft disclaimer must NOT be present for active products
    expect(screen.queryByText('Draft — supplier information awaiting verification')).not.toBeInTheDocument();
    expect(screen.queryByText('Price on enquiry. Purity, certificate evidence, warranty terms and GST remain unconfirmed.')).not.toBeInTheDocument();
    expect(screen.queryByText('Review supplier price breakdown')).not.toBeInTheDocument();

    // 3. Retail pricing & GST badge must be displayed
    expect(screen.getByText('Current Formula Retail Price')).toBeInTheDocument();
    expect(screen.getByText('Includes 3% GST')).toBeInTheDocument();

    // 4. Prominent Technical Specifications Matrix must be visible
    expect(screen.getByText(/Authenticity & Technical Specifications/i)).toBeInTheDocument();
    expect(screen.getByText('925 BIS Stamped')).toBeInTheDocument();
    expect(screen.getByText(/12.4g Net Silver/i)).toBeInTheDocument();

    // 5. Size selector should render Indian Ring Sizes
    expect(screen.getByText('Ring Size (Indian Standard):')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '16' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '18' })).toBeInTheDocument();

    // 6. Add to Bag and Buy Now buttons must be enabled
    const addToBagBtn = screen.getByRole('button', { name: /Add to Shopping Bag/i });
    const buyNowBtn = screen.getByRole('button', { name: /Buy Now \(Insured Express\)/i });
    expect(addToBagBtn).toBeEnabled();
    expect(buyNowBtn).toBeEnabled();

    // 7. Select size 18 and add to bag
    fireEvent.click(screen.getByRole('button', { name: '18' }));
    fireEvent.click(addToBagBtn);

    // 8. Verify cart store receives item with selected size
    const cartItems = useCartStore.getState().items;
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].product.id).toBe(ring.id);
    expect(cartItems[0].selectedAttributes['Ring Size (Indian Standard)']).toBe('18');
  });

  test('Ayyappa Mala renders length selector and production specs', () => {
    const mala = INITIAL_PRODUCTS.find((p) => p.slug === 'ayyappa-silver-tulasi-rudraksha-mala')!;
    renderWithToast(<ProductDetailPage slug={mala.slug} />);

    // Retail pricing
    expect(screen.getByText('Current Formula Retail Price')).toBeInTheDocument();

    // Length selector
    expect(screen.getByText('Mala / Chain Length:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '28 Inches (Traditional Standard)' })).toBeInTheDocument();

    // Purchasing enabled
    expect(screen.getByRole('button', { name: /Add to Shopping Bag/i })).toBeEnabled();
  });

  test('Enquiry product renders bespoke contact UI and keeps ordering flow', () => {
    const enq = ENQUIRY_PRODUCTS[0];
    renderWithToast(<ProductDetailPage slug={enq.slug} />);

    expect(screen.getByRole('heading', { name: enq.name })).toBeInTheDocument();
    expect(screen.getByText('Price on Request / Call to Order')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Call Us: \+91 78991 25449/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Order on WhatsApp/i })).toBeInTheDocument();
  });
});
